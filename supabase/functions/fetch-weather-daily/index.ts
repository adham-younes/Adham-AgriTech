import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ensureServiceAuth, fetchJsonWithCache, parseJson } from '../_shared/runtime.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const estimateEt0 = (t2m: number, ws2m: number, rh2m: number) => 2.5 + (100 - rh2m) * 0.02 + ws2m * 0.08 + Math.max(0, t2m - 20) * 0.12;

type WeatherPayload = { mode?: 'batch'; field_id?: string; lat?: number; lng?: number; date?: string };

Deno.serve(async (req) => {
  try {
    ensureServiceAuth(req);
    const payload = await parseJson<WeatherPayload>(req);

    if (payload.mode === 'batch') {
      const { data: fields } = await supabase.from('fields').select('id,centroid_lat,centroid_lng').limit(1000);
      for (const field of fields ?? []) {
        await processField(field.id, field.centroid_lat, field.centroid_lng, payload.date ?? new Date().toISOString().slice(0, 10));
      }
      return new Response(JSON.stringify({ ok: true, processed: fields?.length ?? 0 }));
    }

    if (!payload.field_id || payload.lat == null || payload.lng == null || !payload.date) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_field_payload' }), { status: 400 });
    }

    await processField(payload.field_id, payload.lat, payload.lng, payload.date);
    return new Response(JSON.stringify({ ok: true }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    const status = message === 'unauthorized' ? 401 : message === 'invalid_json_body' ? 400 : 500;
    return new Response(JSON.stringify({ ok: false, error: message }), { status });
  }
});

async function processField(fieldId: string, lat: number, lng: number, date: string) {
  const base = Deno.env.get('NASA_POWER_BASE_URL') ?? 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const start = date.replaceAll('-', '');
  const url = `${base}?parameters=T2M,WS2M,RH2M,PRECTOTCORR&community=AG&latitude=${lat}&longitude=${lng}&start=${start}&end=${start}&format=JSON`;
  const weather = await fetchJsonWithCache(supabase, 'NASA_POWER', `weather:${fieldId}:${date}`, url, 24 * 60);

  await supabase.from('weather_snapshots_daily').upsert({ field_id: fieldId, date, payload: weather }, { onConflict: 'field_id,date' });

  const t2m = Number((weather as any)?.properties?.parameter?.T2M?.[start] ?? 30);
  const ws2m = Number((weather as any)?.properties?.parameter?.WS2M?.[start] ?? 2);
  const rh2m = Number((weather as any)?.properties?.parameter?.RH2M?.[start] ?? 40);
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
