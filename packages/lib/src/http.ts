const windows = new Map<string, { count: number; resetAt: number }>();

export async function fetchWithRetry(url: string, init?: RequestInit, retries = 2): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
  }
  throw lastError;
}

export function ensureRateLimit(key: string, maxRequests = 10, windowMs = 60_000): void {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt < now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= maxRequests) {
    throw new Error(`Rate limit reached for ${key}`);
  }
  current.count += 1;
}

export function buildCacheKey(namespace: string, parts: Array<string | number>): string {
  return `${namespace}:${parts.join(':')}`;
}
