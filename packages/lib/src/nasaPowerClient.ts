import { fetchWithRetry } from './http';

export async function getNasaDailyWeather(lat: number, lng: number, date: string) {
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
  return res.json();
}
