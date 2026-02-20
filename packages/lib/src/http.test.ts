import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCacheKey, ensureRateLimit, fetchWithRetry } from './http';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('http helpers', () => {
  it('builds stable cache keys', () => {
    expect(buildCacheKey('nasa', [30.1, 31.2, '2026-02-01'])).toBe('nasa:30.1:31.2:2026-02-01');
  });

  it('throws when rate limit window exceeds limit', () => {
    const key = `rate-limit-${Date.now()}`;
    ensureRateLimit(key, 2, 60_000);
    ensureRateLimit(key, 2, 60_000);
    expect(() => ensureRateLimit(key, 2, 60_000)).toThrow('Rate limit reached');
  });

  it('retries failed requests and returns successful response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('bad', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    vi.stubGlobal('fetch', fetchMock);

    const response = await fetchWithRetry('https://example.com/weather');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(response.ok).toBe(true);
  });

  it('throws the last error after exhausting retries', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWithRetry('https://example.com/weather', undefined, 1)).rejects.toThrow('network down');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
