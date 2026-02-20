import { mapHttpError } from './errors';
import { buildCacheKey, ensureRateLimit, fetchWithRetry } from './http';
import { parseNasaPowerDaily } from './parsers';

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
  try {
    const res = await fetchWithRetry(`${base}?${params.toString()}`);
    const payload = await res.json();
    return { cacheKey, payload, metrics: parseNasaPowerDaily(payload, date) };
  } catch (error) {
    throw mapHttpError(error, 'nasaPowerClient');
  }
}
