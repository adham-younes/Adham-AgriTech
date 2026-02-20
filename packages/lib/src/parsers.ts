export type NasaDailyMetrics = {
  t2m: number | null;
  ws2m: number | null;
  rh2m: number | null;
  precipitation: number | null;
};

function readNasaMetric(payload: unknown, metric: string, date: string): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const maybeParameters = (payload as { properties?: { parameter?: Record<string, Record<string, number>> } }).properties?.parameter;
  const value = maybeParameters?.[metric]?.[date];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parseNasaPowerDaily(payload: unknown, date: string): NasaDailyMetrics {
  const normalizedDate = date.replaceAll('-', '');
  return {
    t2m: readNasaMetric(payload, 'T2M', normalizedDate),
    ws2m: readNasaMetric(payload, 'WS2M', normalizedDate),
    rh2m: readNasaMetric(payload, 'RH2M', normalizedDate),
    precipitation: readNasaMetric(payload, 'PRECTOTCORR', normalizedDate)
  };
}

export function parseWaporMosaicsetCount(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0;
  const items = (payload as { response?: unknown[]; items?: unknown[] }).response ?? (payload as { items?: unknown[] }).items;
  return Array.isArray(items) ? items.length : 0;
}
