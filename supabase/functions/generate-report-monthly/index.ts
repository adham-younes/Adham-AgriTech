import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const endpointKey = 'generate-report-monthly';

function extractIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

async function isAllowed(req: Request): Promise<boolean> {
  const cronSecret = Deno.env.get('SUPABASE_CRON_SECRET');
  if (!cronSecret) return false;
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${cronSecret}`) return false;

  const ip = extractIp(req);
  const { data } = await supabase.rpc('consume_rate_limit', {
    p_key: `${endpointKey}:${ip}`,
    p_max: Number(Deno.env.get('RATE_LIMIT_REPORTS_MAX') ?? 20),
    p_window_seconds: Number(Deno.env.get('RATE_LIMIT_REPORTS_WINDOW_SECONDS') ?? 60)
  });
  return Boolean(data);
}

Deno.serve(async (req) => {
  if (!(await isAllowed(req))) {
    return new Response(JSON.stringify({ ok: false, error: 'forbidden_or_rate_limited' }), { status: 429 });
  }

  try {
    const payload = await req.json();
    const month = payload.month ?? new Date().toISOString().slice(0, 7) + '-01';

    const { data: orgs } = payload.mode === 'batch'
      ? await supabase.from('organizations').select('id,name').limit(1000)
      : { data: [{ id: payload.org_id, name: 'Org' }] };

    for (const org of orgs ?? []) {
      const wapor = await fetch((Deno.env.get('WAPOR_BASE_URL') ?? 'https://data.apps.fao.org/gismgr/api/v2') + '/catalog/workspaces/WAPOR-3/mosaicsets').then((r) => r.json());
      const token = crypto.randomUUID().replaceAll('-', '');
      const html = `<html><body><h1>تقرير إنتاجية المياه</h1><p>المنظمة: ${org.name}</p><p>الشهر: ${month}</p></body></html>`;
      const path = `reports/${org.id}/${month}.html`;

      await supabase.storage.from('reports').upload(path, new TextEncoder().encode(html), { contentType: 'text/html', upsert: true });
      const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);

      const { data: report } = await supabase.from('reports').insert({
        org_id: org.id,
        month,
        type: 'wapor_water_productivity',
        status: 'ready',
        public_token: token,
        artifact_url: pub.publicUrl,
        payload: { source: 'WaPOR v3', sample: wapor?.response?.length ?? 0 }
      }).select('id').single();

      await supabase.rpc('record_audit_event', {
        p_org_id: org.id,
        p_event_type: 'report_created',
        p_status: 'success',
        p_target_table: 'reports',
        p_target_id: report?.id,
        p_metadata: { month }
      });

      await supabase.rpc('record_audit_event', {
        p_org_id: org.id,
        p_event_type: 'public_share_created',
        p_status: 'success',
        p_target_table: 'reports',
        p_target_id: report?.id,
        p_metadata: { month }
      });
    }

    return new Response(JSON.stringify({ ok: true, month }));
  } catch {
    await supabase.rpc('record_audit_event', {
      p_org_id: null,
      p_event_type: 'report_generation_failed',
      p_status: 'failure',
      p_target_table: 'reports',
      p_metadata: { endpoint: endpointKey }
    });
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), { status: 500 });
  }
});
