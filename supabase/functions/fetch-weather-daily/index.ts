import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeEdgeRequest } from '../_shared/auth.ts';
import { asNumber, errorMessage, jsonResponse, readJsonBody, toDateString } from '../_shared/http.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const estimateEt0 = (t2m: number, ws2m: number, rh2m: number) => 2.5 + (100 - rh2m) * 0.02 + ws2m * 0.08 + Math.max(0, t2m - 20) * 0.12;

type WeatherPayload = {
  mode?: 'batch' | 'single';
  field_id?: string;
  tenant_id?: string;
  lat?: number;
  lng?: number;
  date?: string;
};

Deno.serve(async (req) => {
  const auth = authorizeEdgeRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const payload = await readJsonBody<WeatherPayload>(req, { mode: 'batch' });
    const date = toDateString(payload.date, new Date().toISOString().slice(0, 10));

    if (!payload.mode || payload.mode === 'batch') {
      const { data: fields, error: fieldsError } = await supabase
        .from('fields')
        .select('id,tenant_id,centroid_lat,centroid_lng')
        .limit(1000);
      if (fieldsError) throw fieldsError;

      let processed = 0;
      let failed = 0;

      for (const field of fields ?? []) {
        try {
          await processField(
            field.id,
            field.tenant_id,
            asNumber(field.centroid_lat, Number.NaN),
            asNumber(field.centroid_lng, Number.NaN),
            date
          );
          processed += 1;
        } catch (error) {
          failed += 1;
          console.error('fetch-weather-daily: field failed', field.id, errorMessage(error));
        }
      }

      return jsonResponse({ ok: true, mode: 'batch', processed, failed, date, auth_mode: auth.mode }, failed ? 207 : 200);
    }

    if (!payload.field_id || !payload.tenant_id || payload.lat === undefined || payload.lng === undefined) {
      return jsonResponse({ ok: false, error: 'invalid_single_payload' }, 400);
    }

    await processField(
      payload.field_id,
      payload.tenant_id,
      asNumber(payload.lat, Number.NaN),
      asNumber(payload.lng, Number.NaN),
      date
    );
    return jsonResponse({ ok: true, mode: 'single', processed: 1, date, auth_mode: auth.mode });
  } catch (error) {
    console.error('fetch-weather-daily: fatal', errorMessage(error));
    return jsonResponse({ ok: false, error: errorMessage(error) }, 500);
  }
});

async function processField(fieldId: string, tenantId: string, lat: number, lng: number, date: string) {
  if (!fieldId || !tenantId || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('invalid_field_coordinates');
  }

  const base = Deno.env.get('NASA_POWER_BASE_URL') ?? 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const start = date.replaceAll('-', '');
  const url = `${base}?parameters=T2M,WS2M,RH2M,PRECTOTCORR&community=AG&latitude=${lat}&longitude=${lng}&start=${start}&end=${start}&format=JSON`;

  const weatherRes = await fetch(url);
  if (!weatherRes.ok) {
    throw new Error(`nasa_power_http_${weatherRes.status}`);
  }
  const weather = await weatherRes.json();

  const weatherUpsert = await supabase
    .from('weather_snapshots_daily')
    .upsert({ field_id: fieldId, date, payload: weather }, { onConflict: 'field_id,date' });
  if (weatherUpsert.error) throw weatherUpsert.error;

  const t2m = asNumber(weather?.properties?.parameter?.T2M?.[start], 30);
  const ws2m = asNumber(weather?.properties?.parameter?.WS2M?.[start], 2);
  const rh2m = asNumber(weather?.properties?.parameter?.RH2M?.[start], 40);
  const et0 = Number(estimateEt0(t2m, ws2m, rh2m).toFixed(2));
  const recommended = Number((et0 * 1.1).toFixed(2));

  const irrigationUpsert = await supabase.from('irrigation_recommendations_daily').upsert(
    {
      field_id: fieldId,
      date,
      et0_mm: et0,
      recommended_mm: recommended,
      reasoning: 'Simplified ET0 + 10% safety factor',
      confidence: 0.72
    },
    { onConflict: 'field_id,date' }
  );
  if (irrigationUpsert.error) throw irrigationUpsert.error;

  if (t2m > 38) {
    const alertUpsert = await supabase.from('alerts').upsert(
      {
        tenant_id: tenantId,
        field_id: fieldId,
        date,
        type: 'heat',
        severity: 'high',
        title: 'Heat-wave warning',
        status: 'open',
        source: 'weather_pipeline',
        metadata: { category: 'heat', et0_mm: et0 },
        triggered_at: new Date().toISOString(),
        message: 'Heat-wave warning: monitor soil moisture and execute irrigation plan.'
      },
      { onConflict: 'field_id,date,type' }
    );
    if (alertUpsert.error) throw alertUpsert.error;
  }
}
