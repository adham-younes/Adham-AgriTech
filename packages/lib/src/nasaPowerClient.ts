import { buildCacheKey, ensureRateLimit, fetchWithRetry } from './http';

export async function getNasaDailyWeather(lat: number, lng: number, date: string) {
  ensureRateLimit('nasa-power', 30, 60_000);
  const cacheKey = buildCacheKey('nasa-power', [lat.toFixed(3), lng.toFixed(3), date]);
  const base = process.env.NASA_POWER_BASE_URL ?? 'https://power.larc.nasa.gov/api/temporal/daily/point';
  const params = new URLSearchParams({
    parameters: 'T2M,WS2M,RH2M,PRECTOTCORR',
    community: 'AG',
    latitude: String(lat),
    longitude: String(lng),
    start: date.replaceAll('-', ''),
    end: date.replaceAll('-', ''),
    format: 'JSON'
  });
  const res = await fetchWithRetry(`${base}?${params.toString()}`);
  return { cacheKey, payload: await res.json() };
}
