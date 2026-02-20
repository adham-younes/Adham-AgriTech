import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function parseJson<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new Error('invalid_json_body');
  }
}

export function ensureServiceAuth(req: Request): void {
  const auth = req.headers.get('authorization');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey || !auth || auth !== `Bearer ${serviceKey}`) {
    throw new Error('unauthorized');
  }
}

export async function withRetry<T>(run: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function fetchJsonWithCache(
  supabase: SupabaseClient,
  provider: string,
  cacheKey: string,
  url: string,
  ttlMinutes: number
): Promise<unknown> {
  const { data: cached } = await supabase
    .from('external_api_cache')
    .select('payload,expires_at')
    .eq('cache_key', cacheKey)
    .maybeSingle();

  if (cached?.payload && new Date(cached.expires_at).getTime() > Date.now()) {
    return cached.payload;
  }

  const payload = await withRetry(async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`upstream_${res.status}`);
    return await res.json();
  });

  await supabase.from('external_api_cache').upsert(
    {
      provider,
      cache_key: cacheKey,
      payload,
      expires_at: new Date(Date.now() + ttlMinutes * 60_000).toISOString()
    },
    { onConflict: 'cache_key' }
  );

  return payload;
}
