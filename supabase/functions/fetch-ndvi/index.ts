import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authorizeEdgeRequest } from '../_shared/auth.ts';
import { errorMessage, jsonResponse, readJsonBody, toDateString } from '../_shared/http.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

type NdviPayload = {
  mode?: 'batch' | 'single';
  field_id?: string;
  tenant_id?: string;
  geometry?: unknown;
  start_date?: string;
  end_date?: string;
};

type NdviResult =
  | { ok: true; ndviMean: number; cloudPct: number | null }
  | { ok: false; reason: string };

Deno.serve(async (req) => {
  const auth = authorizeEdgeRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const payload = await readJsonBody<NdviPayload>(req, { mode: 'batch' });
    const endDate = toDateString(payload.end_date, new Date().toISOString().slice(0, 10));
    const startDate = toDateString(payload.start_date, new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10));

    if (payload.mode === 'single') {
      if (!payload.field_id || !payload.tenant_id || !payload.geometry) {
        return jsonResponse({ ok: false, error: 'invalid_single_payload' }, 400);
      }

      const result = await processField(payload.field_id, payload.tenant_id, payload.geometry, startDate, endDate);
      return jsonResponse({ ok: true, mode: 'single', ...result, auth_mode: auth.mode }, result.failed ? 207 : 200);
    }

    const { data: fields, error: fieldsError } = await supabase.from('fields').select('id,tenant_id,geometry').limit(1000);
    if (fieldsError) throw fieldsError;

    let processed = 0;
    let failed = 0;

    for (const field of fields ?? []) {
      try {
        const outcome = await processField(field.id, field.tenant_id, field.geometry, startDate, endDate);
        if (outcome.failed) failed += 1;
        else processed += 1;
      } catch (error) {
        failed += 1;
        console.error('fetch-ndvi: field failed', field.id, errorMessage(error));
      }
    }

    return jsonResponse(
      { ok: true, mode: 'batch', processed, failed, start_date: startDate, end_date: endDate, auth_mode: auth.mode },
      failed ? 207 : 200
    );
  } catch (error) {
    console.error('fetch-ndvi: fatal', errorMessage(error));
    return jsonResponse({ ok: false, error: errorMessage(error) }, 500);
  }
});

async function processField(
  fieldId: string,
  tenantId: string,
  geometry: unknown,
  startDate: string,
  endDate: string
): Promise<{ field_id: string; failed: boolean; reason?: string }> {
  if (!tenantId) {
    return { field_id: fieldId, failed: true, reason: 'missing_tenant_id' };
  }

  const date = endDate;
  const ndviResult = await resolveNdviMean(geometry, startDate, endDate);

  if (!ndviResult.ok) {
    await upsertSystemAlert(fieldId, tenantId, date, ndviResult.reason);
    return { field_id: fieldId, failed: true, reason: ndviResult.reason };
  }

  const { data: previousRows, error: previousError } = await supabase
    .from('satellite_ndvi_timeseries')
    .select('ndvi_mean')
    .eq('field_id', fieldId)
    .lt('date', date)
    .order('date', { ascending: false })
    .limit(4);

  if (previousError) throw previousError;

  const rollingAverage =
    (previousRows ?? []).reduce((acc, row) => acc + Number(row.ndvi_mean), 0) / Math.max((previousRows ?? []).length, 1);

  const ndviUpsert = await supabase.from('satellite_ndvi_timeseries').upsert(
    {
      field_id: fieldId,
      date,
      ndvi_mean: ndviResult.ndviMean,
      cloud_pct: ndviResult.cloudPct
    },
    { onConflict: 'field_id,date' }
  );
  if (ndviUpsert.error) throw ndviUpsert.error;

  if (rollingAverage > 0 && ndviResult.ndviMean < rollingAverage - 0.08) {
    const alertUpsert = await supabase.from('alerts').upsert(
      {
        tenant_id: tenantId,
        field_id: fieldId,
        date,
        type: 'ndvi_drop',
        severity: 'medium',
        title: 'NDVI drop detected',
        status: 'open',
        source: 'ndvi_pipeline',
        metadata: { rolling_avg: rollingAverage, ndvi: ndviResult.ndviMean },
        triggered_at: new Date().toISOString(),
        message: 'NDVI dropped significantly versus rolling baseline.'
      },
      { onConflict: 'field_id,date,type' }
    );
    if (alertUpsert.error) throw alertUpsert.error;
  }

  return { field_id: fieldId, failed: false };
}

async function upsertSystemAlert(fieldId: string, tenantId: string, date: string, reason: string) {
  const alertMessage = `NDVI ingestion degraded: ${reason.replaceAll('_', ' ')}`;
  const alertUpsert = await supabase.from('alerts').upsert(
    {
      tenant_id: tenantId,
      field_id: fieldId,
      date,
      type: 'system',
      severity: 'low',
      title: 'NDVI pipeline degraded',
      status: 'open',
      source: 'ndvi_pipeline',
      metadata: { reason },
      triggered_at: new Date().toISOString(),
      message: alertMessage
    },
    { onConflict: 'field_id,date,type' }
  );
  if (alertUpsert.error) throw alertUpsert.error;
}

async function resolveNdviMean(geometry: unknown, startDate: string, endDate: string): Promise<NdviResult> {
  const clientId = Deno.env.get('SENTINEL_HUB_CLIENT_ID');
  const clientSecret = Deno.env.get('SENTINEL_HUB_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    return { ok: false, reason: 'missing_sentinel_credentials' };
  }

  const tokenRes = await fetch('https://services.sentinel-hub.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret })
  });
  if (!tokenRes.ok) return { ok: false, reason: `sentinel_auth_${tokenRes.status}` };

  const tokenJson = await tokenRes.json();
  const token = tokenJson?.access_token as string | undefined;
  if (!token) return { ok: false, reason: 'missing_sentinel_access_token' };

  const from = `${startDate}T00:00:00Z`;
  const to = `${endDate}T23:59:59Z`;

  const processRes = await fetch('https://services.sentinel-hub.com/api/v1/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      input: { bounds: { geometry }, data: [{ type: 'sentinel-2-l2a', dataFilter: { timeRange: { from, to }, maxCloudCoverage: 60 } }] },
      output: { width: 64, height: 64, responses: [{ identifier: 'default', format: { type: 'application/json' } }] },
      evalscript:
        '//VERSION=3\nfunction setup(){return {input:["B04","B08","dataMask"],output:[{id:"default",bands:1,sampleType:"FLOAT32"}]};}\nfunction evaluatePixel(s){if(s.dataMask===0){return [0];} const d=s.B08+s.B04; return [d===0?0:(s.B08-s.B04)/d];}'
    })
  });
  if (!processRes.ok) return { ok: false, reason: `sentinel_process_${processRes.status}` };

  const contentType = processRes.headers.get('content-type') ?? '';
  let values: number[] = [];

  if (contentType.includes('application/json')) {
    const payload = await processRes.json();
    values = extractNumericValues(payload).filter((value) => Number.isFinite(value) && value >= -1 && value <= 1);
  } else {
    const raw = await processRes.arrayBuffer();
    if (raw.byteLength > 0 && raw.byteLength % 4 === 0) {
      values = Array.from(new Float32Array(raw)).filter((value) => Number.isFinite(value) && value >= -1 && value <= 1);
    }
  }

  if (!values.length) return { ok: false, reason: 'empty_ndvi_response' };

  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  return {
    ok: true,
    ndviMean: Number(Math.max(0, Math.min(1, mean)).toFixed(3)),
    cloudPct: null
  };
}

function extractNumericValues(node: unknown, acc: number[] = []): number[] {
  if (acc.length >= 10_000) return acc;

  if (typeof node === 'number') {
    acc.push(node);
    return acc;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      extractNumericValues(child, acc);
      if (acc.length >= 10_000) break;
    }
    return acc;
  }

  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) {
      extractNumericValues(value, acc);
      if (acc.length >= 10_000) break;
    }
  }

  return acc;
}
