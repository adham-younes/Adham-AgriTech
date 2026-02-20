import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNasaDailyWeather } from './nasaPowerClient';
import { getSentinelNdviPreview } from './sentinelHubClient';
import { getWaporWaterProductivity } from './waporClient';

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

function createJsonResponse(payload: unknown, status = 200): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    arrayBuffer: async () => new ArrayBuffer(0)
  };
}

describe('clients integration (mocked HTTP)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('NASA Power client matrix', () => {
    const cases = [
      { name: 'normal' as const },
      { name: 'edge' as const },
      { name: 'failure' as const }
    ];

    it.each(cases)('covers $name case', async ({ name }) => {
      if (name === 'normal') {
        const payload = { properties: { parameter: { T2M: { '20250101': 30.1 } } } };
        const fetchMock = vi.fn(async () => createJsonResponse(payload));
        vi.stubGlobal('fetch', fetchMock);

        const result = await getNasaDailyWeather(30.0444, 31.2357, '2025-01-01');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
        expect(calledUrl).toContain('latitude=30.0444');
        expect(calledUrl).toContain('longitude=31.2357');
        expect(calledUrl).toContain('start=20250101');
        expect(result.cacheKey).toBe('nasa-power:30.044:31.236:2025-01-01');
        expect(result.payload).toEqual(payload);
        return;
      }

      if (name === 'edge') {
        process.env.NASA_POWER_BASE_URL = 'https://example.com/nasa';
        const payload = { empty: true };
        const fetchMock = vi.fn(async () => createJsonResponse(payload));
        vi.stubGlobal('fetch', fetchMock);

        const result = await getNasaDailyWeather(-90, 180, '2025-12-31');

        const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
        expect(calledUrl.startsWith('https://example.com/nasa?')).toBe(true);
        expect(result.cacheKey).toBe('nasa-power:-90.000:180.000:2025-12-31');
        expect(result.payload).toEqual(payload);
        return;
      }

      vi.useFakeTimers();
      const fetchMock = vi.fn(async () => createJsonResponse({ error: true }, 500));
      vi.stubGlobal('fetch', fetchMock);

      const request = getNasaDailyWeather(30, 31, '2025-01-01');
      const assertion = expect(request).rejects.toThrow('HTTP 500');
      await vi.runAllTimersAsync();
      await assertion;
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('WaPOR client matrix', () => {
    const cases = [
      { name: 'normal' as const },
      { name: 'edge' as const },
      { name: 'failure' as const }
    ];

    it.each(cases)('covers $name case', async ({ name }) => {
      if (name === 'normal') {
        const payload = { items: [{ id: 'A' }] };
        const fetchMock = vi.fn(async () => createJsonResponse(payload));
        vi.stubGlobal('fetch', fetchMock);

        const result = await getWaporWaterProductivity('EGY');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.country).toBe('EGY');
        expect(result.source).toBe('WaPOR v3');
        expect(result.payload).toEqual(payload);
        return;
      }

      if (name === 'edge') {
        process.env.WAPOR_BASE_URL = 'https://example.com/wapor';
        const fetchMock = vi.fn(async () => createJsonResponse({ items: [] }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await getWaporWaterProductivity('');

        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
          'https://example.com/wapor/catalog/workspaces/WAPOR-3/mosaicsets'
        );
        expect(result.country).toBe('');
        expect(result.cacheKey.startsWith('wapor::')).toBe(true);
        return;
      }

      vi.useFakeTimers();
      const fetchMock = vi.fn(async () => createJsonResponse({ failed: true }, 503));
      vi.stubGlobal('fetch', fetchMock);

      const request = getWaporWaterProductivity('EGY');
      const assertion = expect(request).rejects.toThrow('HTTP 503');
      await vi.runAllTimersAsync();
      await assertion;
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('Sentinel Hub client matrix', () => {
    const cases = [
      { name: 'normal' as const },
      { name: 'edge' as const },
      { name: 'failure' as const }
    ];

    it.each(cases)('covers $name case', async ({ name }) => {
      if (name === 'normal') {
        const pngBytes = new Uint8Array([137, 80, 78, 71]).buffer;
        const fetchMock = vi.fn(async () => ({
          ok: true,
          status: 200,
          json: async () => ({}),
          arrayBuffer: async () => pngBytes
        }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await getSentinelNdviPreview({ type: 'Polygon', coordinates: [] }, '2025-01-01', '2025-01-10');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.cacheKey).toBe('sentinel:2025-01-01:2025-01-10');
        expect(result.image).toEqual(pngBytes);
        return;
      }

      if (name === 'edge') {
        process.env.SENTINEL_HUB_ACCESS_TOKEN = 'edge-token';
        const fetchMock = vi.fn(async () => createJsonResponse({}, 200));
        vi.stubGlobal('fetch', fetchMock);

        await getSentinelNdviPreview({ type: 'Point', coordinates: [31.2, 30.0] }, '2025-02-01', '2025-02-01');

        const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
        const headers = options.headers as Record<string, string>;
        expect(headers.Authorization).toBe('Bearer edge-token');
        expect(options.method).toBe('POST');
        return;
      }

      vi.useFakeTimers();
      const fetchMock = vi.fn(async () => createJsonResponse({ failed: true }, 502));
      vi.stubGlobal('fetch', fetchMock);

      const request = getSentinelNdviPreview({ type: 'Polygon', coordinates: [] }, '2025-01-01', '2025-01-02');
      const assertion = expect(request).rejects.toThrow('HTTP 502');
      await vi.runAllTimersAsync();
      await assertion;
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
