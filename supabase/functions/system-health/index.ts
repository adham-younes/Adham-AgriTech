import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeEdgeRequest } from '../_shared/auth.ts';
import { errorMessage, jsonResponse } from '../_shared/http.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const auth = authorizeEdgeRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const [orgs, fields, alerts, readyReports, latestWeather, latestNdvi] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact', head: true }),
      supabase.from('fields').select('id', { count: 'exact', head: true }),
      supabase.from('alerts').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'ready'),
      supabase.from('weather_snapshots_daily').select('date').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('satellite_ndvi_timeseries').select('date').order('date', { ascending: false }).limit(1).maybeSingle()
    ]);

    const weatherAge = daysSince(latestWeather.data?.date ?? null);
    const ndviAge = daysSince(latestNdvi.data?.date ?? null);

    const warnings: string[] = [];
    if (weatherAge !== null && weatherAge > 2) warnings.push('weather_data_stale');
    if (ndviAge !== null && ndviAge > 10) warnings.push('ndvi_data_stale');

    const status = warnings.length ? 'degraded' : 'ok';

    return jsonResponse({
      status,
      auth_mode: auth.mode,
      counts: {
        organizations: orgs.count ?? 0,
        fields: fields.count ?? 0,
        open_alerts: alerts.count ?? 0,
        ready_reports: readyReports.count ?? 0
      },
      freshness: {
        weather_latest_date: latestWeather.data?.date ?? null,
        weather_age_days: weatherAge,
        ndvi_latest_date: latestNdvi.data?.date ?? null,
        ndvi_age_days: ndviAge
      },
      warnings
    });
  } catch (error) {
    console.error('system-health: fatal', errorMessage(error));
    return jsonResponse({ status: 'down', error: errorMessage(error) }, 500);
  }
});

function daysSince(value: string | null): number | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 86_400_000);
}
