import { jsonResponse, log, recordJobRun, supabase } from '../_shared/runtime.ts';

Deno.serve(async () => {
  const startedAt = Date.now();

  try {
    const [orgs, fields, alerts, jobRuns, weatherLatest, ndviLatest, cacheStats] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('fields').select('id', { count: 'exact', head: true }),
      supabase.from('alerts').select('id', { count: 'exact', head: true }),
      supabase.from('job_runs').select('status,latency_ms,created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('weather_snapshots_daily').select('date').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('satellite_ndvi_timeseries').select('date').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('external_api_cache').select('provider,expires_at').order('created_at', { ascending: false }).limit(200)
    ]);

    const runs = jobRuns.data ?? [];
    const failedJobs = runs.filter((r) => r.status === 'failed').length;
    const avgLatencyMs = runs.length
      ? Math.round(runs.reduce((acc, row) => acc + Number(row.latency_ms ?? 0), 0) / runs.length)
      : 0;

    const now = Date.now();
    const weatherFreshnessHours = weatherLatest.data?.date
      ? Math.round((now - new Date(weatherLatest.data.date).getTime()) / 36e5)
      : null;
    const ndviFreshnessHours = ndviLatest.data?.date
      ? Math.round((now - new Date(ndviLatest.data.date).getTime()) / 36e5)
      : null;

    const providerFreshness = Object.entries(
      (cacheStats.data ?? []).reduce((acc: Record<string, number>, row) => {
        const ttlLeftHours = Math.round((new Date(row.expires_at).getTime() - now) / 36e5);
        if (!(row.provider in acc)) {
          acc[row.provider] = ttlLeftHours;
        }
        return acc;
      }, {})
    ).map(([provider, ttlLeftHours]) => ({ provider, ttlLeftHours }));

    const degraded = failedJobs > 5 || (weatherFreshnessHours ?? 999) > 30 || (ndviFreshnessHours ?? 999) > 240;

    await recordJobRun({
      jobName: 'system-health',
      status: 'success',
      latencyMs: Date.now() - startedAt,
      details: { failedJobs, avgLatencyMs }
    });

    return jsonResponse({
      status: degraded ? 'degraded' : 'ok',
      counts: {
        organizations: orgs.count ?? 0,
        fields: fields.count ?? 0,
        alerts: alerts.count ?? 0
      },
      indicators: {
        avgLatencyMs,
        failedJobsLast100: failedJobs,
        weatherFreshnessHours,
        ndviFreshnessHours,
        cacheTtlLeftByProvider: providerFreshness
      }
    });
  } catch (error) {
    log('error', 'system-health failed', { error: String(error) });
    await recordJobRun({ jobName: 'system-health', status: 'failed', latencyMs: Date.now() - startedAt, details: { error: String(error) } });
    return jsonResponse({ status: 'error', error: 'system-health failed' }, 500);
  }
});
