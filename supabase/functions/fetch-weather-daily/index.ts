import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const endpointKey = 'fetch-weather-daily';

const estimateEt0 = (t2m: number, ws2m: number, rh2m: number) => 2.5 + (100 - rh2m) * 0.02 + ws2m * 0.08 + Math.max(0, t2m - 20) * 0.12;

function extractIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

async function isAllowed(req: Request): Promise<boolean> {
  const cronSecret = Deno.env.get('SUPABASE_CRON_SECRET');
  if (!cronSecret) return false;
  if ((req.headers.get('authorization') ?? '') !== `Bearer ${cronSecret}`) return false;

  const { data } = await supabase.rpc('consume_rate_limit', {
    p_key: `${endpointKey}:${extractIp(req)}`,
    p_max: Number(Deno.env.get('RATE_LIMIT_SYNC_MAX') ?? 30),
    p_window_seconds: Number(Deno.env.get('RATE_LIMIT_SYNC_WINDOW_SECONDS') ?? 60)
  });
  return Boolean(data);
}

Deno.serve(async (req) => {
  if (!(await isAllowed(req))) {
    return new Response(JSON.stringify({ ok: false, error: 'forbidden_or_rate_limited' }), { status: 429 });
  }

  try {
    const payload = await req.json();
    if (payload.mode === 'batch') {
      const { data: fields } = await supabase.from('fields').select('id,centroid_lat,centroid_lng,farm_id').limit(1000);
      for (const field of fields ?? []) {
        await processField(field.id, field.farm_id, field.centroid_lat, field.centroid_lng, payload.date ?? new Date().toISOString().slice(0, 10));
      }
      return new Response(JSON.stringify({ ok: true, processed: fields?.length ?? 0 }));
    }

    await processField(payload.field_id, payload.farm_id, payload.lat, payload.lng, payload.date);
    return new Response(JSON.stringify({ ok: true }));
  } catch {
    await supabase.rpc('record_audit_event', {
      p_org_id: null,
      p_event_type: 'weather_sync_failed',
      p_status: 'failure',
      p_target_table: 'weather_snapshots_daily',
      p_metadata: { endpoint: endpointKey }
    });
    return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), { status: 500 });
  }
});

async function processField(fieldId: string, farmId: string, lat: number, lng: number, date: string) {
  const base = Deno.env.get('NASA_POWER_BASE_URL') ?? 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const start = date.replaceAll('-', '');
  const url = `${base}?parameters=T2M,WS2M,RH2M,PRECTOTCORR&community=AG&latitude=${lat}&longitude=${lng}&start=${start}&end=${start}&format=JSON`;
  const weatherRes = await fetch(url);
  if (!weatherRes.ok) {
    throw new Error('weather_provider_unavailable');
  }

  const weather = await weatherRes.json();

  await supabase.from('weather_snapshots_daily').upsert({ field_id: fieldId, date, payload: weather }, { onConflict: 'field_id,date' });

  const t2m = Number(weather?.properties?.parameter?.T2M?.[start] ?? 30);
  const ws2m = Number(weather?.properties?.parameter?.WS2M?.[start] ?? 2);
  const rh2m = Number(weather?.properties?.parameter?.RH2M?.[start] ?? 40);
  const et0 = Number(estimateEt0(t2m, ws2m, rh2m).toFixed(2));
  const recommended = Number((et0 * 1.1).toFixed(2));

  await supabase.from('irrigation_recommendations_daily').upsert({
    field_id: fieldId,
    date,
    et0_mm: et0,
    recommended_mm: recommended,
    reasoning: 'ET0 مبسط + معامل أمان 10%',
    confidence: 0.72
  }, { onConflict: 'field_id,date' });

  if (t2m > 38) {
    await supabase.from('alerts').insert({ field_id: fieldId, date, type: 'heat', severity: 4, message: 'تحذير موجة حر: يوصى بمتابعة رطوبة التربة.' });
  }

  const { data: farm } = await supabase.from('farms').select('org_id').eq('id', farmId).maybeSingle();
  await supabase.rpc('record_audit_event', {
    p_org_id: farm?.org_id ?? null,
    p_event_type: 'weather_sync_completed',
    p_status: 'success',
    p_target_table: 'weather_snapshots_daily',
    p_target_id: fieldId,
    p_metadata: { date }
  });
}
