import {
  getCachedOrFetch,
  jsonResponse,
  log,
  parseJsonRequest,
  recordJobRun,
  recordUsageEvent,
  supabase,
  withRetry,
  withinPlanLimit
} from '../_shared/runtime.ts';

const WAPOR_TTL_HOURS = 24;

Deno.serve(async (req) => {
  const startedAt = Date.now();
  const payload = await parseJsonRequest(req);
  const month = payload.month ?? new Date().toISOString().slice(0, 7) + '-01';

  try {
    const { data: orgs } = payload.mode === 'batch'
      ? await supabase.from('organizations').select('id,name').limit(1000)
      : { data: [{ id: payload.org_id, name: 'Org' }] };

    let processed = 0;
    let skippedByPlan = 0;

    for (const org of orgs ?? []) {
      const allowed = await withinPlanLimit({ orgId: org.id, eventType: 'monthly_report' });
      if (!allowed) {
        skippedByPlan += 1;
        continue;
      }

      const { payload: wapor } = await getCachedOrFetch({
        provider: 'WAPOR',
        cacheKey: `wapor:mosaicsets:${month}`,
        ttlHours: WAPOR_TTL_HOURS,
        fetcher: async () => {
          const res = await withRetry('wapor-fetch', () =>
            fetch((Deno.env.get('WAPOR_BASE_URL') ?? 'https://data.apps.fao.org/gismgr/api/v2') + '/catalog/workspaces/WAPOR-3/mosaicsets')
          );
          if (!res.ok) throw new Error(`WaPOR ${res.status}`);
          return await res.json();
        }
      });

      const token = crypto.randomUUID().replaceAll('-', '');
      const html = `<html><body><h1>تقرير إنتاجية المياه</h1><p>المنظمة: ${org.name}</p><p>الشهر: ${month}</p></body></html>`;
      const path = `reports/${org.id}/${month}.html`;

      await supabase.storage.from('reports').upload(path, new TextEncoder().encode(html), { contentType: 'text/html', upsert: true });
      const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);

      await supabase.from('reports').insert({
        org_id: org.id,
        month,
        type: 'wapor_water_productivity',
        status: 'ready',
        public_token: token,
        artifact_url: pub.publicUrl,
        payload: { source: 'WaPOR v3', sample: wapor?.response?.length ?? 0 }
      });

      await recordUsageEvent(org.id, 'monthly_report', 1);
      processed += 1;
    }

    await recordJobRun({ jobName: 'generate-report-monthly', status: 'success', latencyMs: Date.now() - startedAt, details: { processed, skippedByPlan } });
    return jsonResponse({ ok: true, month, processed, skippedByPlan });
  } catch (error) {
    log('error', 'generate-report-monthly failed', { error: String(error) });
    await recordJobRun({ jobName: 'generate-report-monthly', status: 'failed', latencyMs: Date.now() - startedAt, details: { error: String(error) } });
    return jsonResponse({ ok: false, error: 'report job failed' }, 500);
  }
});
