import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeEdgeRequest } from '../_shared/auth.ts';
import { errorMessage, jsonResponse, readJsonBody, toMonthStart } from '../_shared/http.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

type ReportPayload = {
  mode?: 'batch' | 'single';
  org_id?: string;
  month?: string;
};

Deno.serve(async (req) => {
  const auth = authorizeEdgeRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const payload = await readJsonBody<ReportPayload>(req, { mode: 'batch' });
    const month = toMonthStart(payload.month, `${new Date().toISOString().slice(0, 7)}-01`);
    const reportType = 'wapor_water_productivity';

    const { data: orgs, error: orgError } = await resolveTargetOrganizations(payload);
    if (orgError) throw orgError;
    if (!(orgs ?? []).length) {
      return jsonResponse({ ok: false, error: 'no_target_organizations' }, 400);
    }

    const wapor = await fetchWaporSummary();

    let processed = 0;
    let failed = 0;

    for (const org of orgs ?? []) {
      try {
        const path = `reports/${org.id}/${month}.html`;
        const html = buildReportHtml({ orgName: org.name, month, waporSampleCount: wapor.sampleCount });
        const binary = new TextEncoder().encode(html);

        const uploadRes = await supabase.storage.from('reports').upload(path, binary, { contentType: 'text/html; charset=utf-8', upsert: true });
        if (uploadRes.error) throw uploadRes.error;

        const { data: publicUrlData } = supabase.storage.from('reports').getPublicUrl(path);
        const reportPayload = {
          source: 'WaPOR v3',
          sample: wapor.sampleCount,
          generated_at: new Date().toISOString(),
          report_path: path
        };

        const { data: existing, error: existingError } = await supabase
          .from('reports')
          .select('id,public_token')
          .eq('org_id', org.id)
          .eq('month', month)
          .eq('type', reportType)
          .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
          const updateRes = await supabase
            .from('reports')
            .update({
              tenant_id: org.id,
              report_type: reportType,
              storage_path: path,
              generated_at: new Date().toISOString(),
              metadata: reportPayload,
              status: 'ready',
              artifact_url: publicUrlData.publicUrl,
              payload: reportPayload
            })
            .eq('id', existing.id);

          if (updateRes.error) throw updateRes.error;
        } else {
          const token = crypto.randomUUID().replaceAll('-', '');
          const insertRes = await supabase.from('reports').insert({
            tenant_id: org.id,
            report_type: reportType,
            storage_path: path,
            generated_at: new Date().toISOString(),
            metadata: reportPayload,
            org_id: org.id,
            month,
            type: reportType,
            status: 'ready',
            public_token: token,
            artifact_url: publicUrlData.publicUrl,
            payload: reportPayload
          });
          if (insertRes.error) throw insertRes.error;
        }

        processed += 1;
      } catch (error) {
        failed += 1;
        console.error('generate-report-monthly: org failed', org.id, errorMessage(error));
      }
    }

    return jsonResponse(
      { ok: true, month, mode: payload.mode ?? 'batch', processed, failed, auth_mode: auth.mode },
      failed ? 207 : 200
    );
  } catch (error) {
    console.error('generate-report-monthly: fatal', errorMessage(error));
    return jsonResponse({ ok: false, error: errorMessage(error) }, 500);
  }
});

async function resolveTargetOrganizations(payload: ReportPayload) {
  if (payload.mode === 'single') {
    if (!payload.org_id) {
      return { data: null, error: new Error('missing_org_id_for_single_mode') };
    }

    return await supabase.from('organizations').select('id,name').eq('id', payload.org_id).limit(1);
  }

  return await supabase.from('organizations').select('id,name').limit(1000);
}

async function fetchWaporSummary(): Promise<{ sampleCount: number }> {
  const base = Deno.env.get('WAPOR_BASE_URL') ?? 'https://data.apps.fao.org/gismgr/api/v2';
  const endpoint = `${base}/catalog/workspaces/WAPOR-3/mosaicsets`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`wapor_http_${res.status}`);
  }

  const json = await res.json();
  const responseArray = Array.isArray(json?.response) ? json.response : [];
  const itemsArray = Array.isArray(json?.items) ? json.items : [];

  return { sampleCount: Math.max(responseArray.length, itemsArray.length) };
}

function buildReportHtml({ orgName, month, waporSampleCount }: { orgName: string; month: string; waporSampleCount: number }) {
  const safeOrg = escapeHtml(orgName);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Water Productivity Report</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #041208; color: #f8fafc; margin: 0; padding: 24px; }
    .card { border: 1px solid rgba(16,185,129,.35); border-radius: 16px; padding: 24px; max-width: 820px; margin: 0 auto; background: rgba(2,15,8,.85); }
    h1 { margin: 0 0 8px; font-size: 30px; }
    p { color: #cbd5e1; margin: 8px 0; }
    .metric { margin-top: 16px; font-size: 20px; color: #34d399; font-weight: 700; }
    .muted { font-size: 12px; color: #94a3b8; margin-top: 24px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Monthly Water Productivity Report</h1>
    <p>Organization: ${safeOrg}</p>
    <p>Month: ${month}</p>
    <p class="metric">WaPOR sample coverage: ${waporSampleCount}</p>
    <p class="muted">Generated automatically by Adham AgriTech reporting pipeline.</p>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
