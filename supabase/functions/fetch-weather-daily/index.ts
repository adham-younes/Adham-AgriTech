import {
  getCachedOrFetch,
  jsonResponse,
  log,
  parseJsonRequest,
  recordJobRun,
  supabase,
  withRetry
} from '../_shared/runtime.ts';

const WEATHER_TTL_HOURS = 24;

const estimateEt0 = (t2m: number, ws2m: number, rh2m: number) => 2.5 + (100 - rh2m) * 0.02 + ws2m * 0.08 + Math.max(0, t2m - 20) * 0.12;

Deno.serve(async (req) => {
  const startedAt = Date.now();
  const payload = await parseJsonRequest(req);

  try {
    if (payload.mode === 'batch') {
      const date = payload.date ?? new Date().toISOString().slice(0, 10);
      const { data: fields } = await supabase.from('fields').select('id,centroid_lat,centroid_lng').limit(1000);
      for (const field of fields ?? []) {
        await processField(field.id, Number(field.centroid_lat), Number(field.centroid_lng), date);
      }

      await recordJobRun({ jobName: 'fetch-weather-daily', status: 'success', latencyMs: Date.now() - startedAt, details: { processed: fields?.length ?? 0 } });
      return jsonResponse({ ok: true, processed: fields?.length ?? 0 });
    }

    await processField(payload.field_id, Number(payload.lat), Number(payload.lng), payload.date ?? new Date().toISOString().slice(0, 10));
    await recordJobRun({ jobName: 'fetch-weather-daily', status: 'success', latencyMs: Date.now() - startedAt, details: { mode: 'single' } });
    return jsonResponse({ ok: true });
  } catch (error) {
    log('error', 'fetch-weather-daily failed', { error: String(error) });
    await recordJobRun({ jobName: 'fetch-weather-daily', status: 'failed', latencyMs: Date.now() - startedAt, details: { error: String(error) } });
    return jsonResponse({ ok: false, error: 'weather job failed' }, 500);
  }
});

async function processField(fieldId: string, lat: number, lng: number, date: string) {
  const base = Deno.env.get('NASA_POWER_BASE_URL') ?? 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const start = date.replaceAll('-', '');
  const cacheKey = `weather:${lat.toFixed(4)}:${lng.toFixed(4)}:${start}`;

  const { payload: weather } = await getCachedOrFetch({
    provider: 'NASA_POWER',
    cacheKey,
    ttlHours: WEATHER_TTL_HOURS,
    fetcher: async () => {
      const url = `${base}?parameters=T2M,WS2M,RH2M,PRECTOTCORR&community=AG&latitude=${lat}&longitude=${lng}&start=${start}&end=${start}&format=JSON`;
      const res = await withRetry('nasa-power', () => fetch(url));
      if (!res.ok) {
        throw new Error(`NASA POWER ${res.status}`);
      }
      return await res.json();
    }
  });

  await supabase.from('weather_snapshots_daily').upsert({ field_id: fieldId, date, payload: weather }, { onConflict: 'field_id,date' });

  const t2m = Number(weather?.properties?.parameter?.T2M?.[start] ?? 30);
  const ws2m = Number(weather?.properties?.parameter?.WS2M?.[start] ?? 2);
  const rh2m = Number(weather?.properties?.parameter?.RH2M?.[start] ?? 40);
  const et0 = Number(estimateEt0(t2m, ws2m, rh2m).toFixed(2));
  const recommended = Number((et0 * 1.1).toFixed(2));

  await supabase.from('irrigation_recommendations_daily').upsert(
    {
      field_id: fieldId,
      date,
      et0_mm: et0,
      recommended_mm: recommended,
      reasoning: 'ET0 مبسط + معامل أمان 10%',
      confidence: 0.72
    },
    { onConflict: 'field_id,date' }
  );

  if (t2m > 38) {
    await supabase.from('alerts').insert({ field_id: fieldId, date, type: 'heat', severity: 4, message: 'تحذير موجة حر: يوصى بمتابعة رطوبة التربة.' });
  }
}
