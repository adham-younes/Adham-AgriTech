import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  console[level](`[${new Date().toISOString()}] ${message}`, context);
}

export async function parseJsonRequest(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function withRetry<T>(
  operationName: string,
  fn: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 300;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      log('warn', `${operationName} failed`, { attempt, attempts, error: String(error) });
      if (attempt < attempts) {
        const waitMs = baseDelayMs * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }
  throw lastError;
}

export async function getCachedOrFetch<T>(params: {
  provider: string;
  cacheKey: string;
  ttlHours: number;
  fetcher: () => Promise<T>;
}) {
  const now = new Date().toISOString();
  const { data: cached } = await supabase
    .from('external_api_cache')
    .select('payload,expires_at')
    .eq('cache_key', params.cacheKey)
    .eq('provider', params.provider)
    .gt('expires_at', now)
    .maybeSingle();

  if (cached?.payload) {
    return { payload: cached.payload as T, cacheHit: true };
  }

  const payload = await params.fetcher();
  const expiresAt = new Date(Date.now() + params.ttlHours * 3600 * 1000).toISOString();

  await supabase.from('external_api_cache').upsert(
    {
      provider: params.provider,
      cache_key: params.cacheKey,
      payload,
      expires_at: expiresAt
    },
    { onConflict: 'cache_key' }
  );

  return { payload, cacheHit: false };
}

export async function withinPlanLimit(params: {
  orgId: string;
  eventType: 'ndvi_check' | 'monthly_report';
}) {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase.rpc('within_plan_limit', {
    target_org: params.orgId,
    target_event_type: params.eventType,
    from_date: monthStart.toISOString().slice(0, 10)
  });

  if (error) {
    throw new Error(`plan limit check failed: ${error.message}`);
  }

  return Boolean(data);
}

export async function recordUsageEvent(orgId: string, eventType: string, units = 1) {
  const { error } = await supabase.from('usage_events').insert({
    org_id: orgId,
    event_type: eventType,
    units
  });
  if (error) {
    log('warn', 'failed to record usage event', { orgId, eventType, error: error.message });
  }
}

export async function recordJobRun(params: {
  jobName: string;
  status: 'success' | 'failed';
  latencyMs: number;
  details?: Record<string, unknown>;
}) {
  const { error } = await supabase.from('job_runs').insert({
    job_name: params.jobName,
    status: params.status,
    latency_ms: params.latencyMs,
    details: params.details ?? {}
  });
  if (error) {
    log('warn', 'failed to persist job run', { job: params.jobName, error: error.message });
  }
}
