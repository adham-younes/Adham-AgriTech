import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNasaDailyWeather } from './nasaPowerClient';
import { getSentinelNdviPreview } from './sentinelHubClient';
import { getWaporWaterProductivity } from './waporClient';

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NASA_POWER_BASE_URL;
  delete process.env.WAPOR_BASE_URL;
  delete process.env.SENTINEL_HUB_ACCESS_TOKEN;
});

describe('client integration with transformed payloads', () => {
  it('transforms nasa power payload to normalized metrics', async () => {
    process.env.NASA_POWER_BASE_URL = 'https://nasa.test';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            properties: {
              parameter: {
                T2M: { '20260216': 30 },
                WS2M: { '20260216': 2 },
                RH2M: { '20260216': 45 },
                PRECTOTCORR: { '20260216': 0.3 }
              }
            }
          }),
          { status: 200 }
        )
      )
    );

    const result = await getNasaDailyWeather(30.1234, 31.5678, '2026-02-16');

    expect(result.cacheKey).toBe('nasa-power:30.123:31.568:2026-02-16');
    expect(result.metrics).toEqual({ t2m: 30, ws2m: 2, rh2m: 45, precipitation: 0.3 });
  });

  it('transforms wapor payload by adding mosaicset count', async () => {
    process.env.WAPOR_BASE_URL = 'https://wapor.test';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ response: [{}, {}, {}] }), { status: 200 })));

    const result = await getWaporWaterProductivity('EGY');

    expect(result.country).toBe('EGY');
    expect(result.mosaicsetCount).toBe(3);
  });

  it('returns binary sentinel image with cache key and auth header', async () => {
    process.env.SENTINEL_HUB_ACCESS_TOKEN = 'token-123';
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getSentinelNdviPreview({ type: 'Polygon', coordinates: [] }, '2026-02-01', '2026-02-10');

    expect(result.cacheKey).toBe('sentinel:2026-02-01:2026-02-10');
    expect(result.image.byteLength).toBe(3);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://services.sentinel-hub.com/api/v1/process',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token-123' }) })
    );
  });
});
