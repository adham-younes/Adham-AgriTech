import { mapHttpError } from './errors';
import { buildCacheKey, ensureRateLimit, fetchWithRetry } from './http';
import { parseWaporMosaicsetCount } from './parsers';

export async function getWaporWaterProductivity(country = 'EGY') {
  ensureRateLimit('wapor', 20, 60_000);
  const cacheKey = buildCacheKey('wapor', [country, new Date().toISOString().slice(0, 7)]);
  const base = process.env.WAPOR_BASE_URL ?? 'https://data.apps.fao.org/gismgr/api/v2';
  try {
    const res = await fetchWithRetry(`${base}/catalog/workspaces/WAPOR-3/mosaicsets`);
    const payload = await res.json();
    return { cacheKey, country, source: 'WaPOR v3', payload, mosaicsetCount: parseWaporMosaicsetCount(payload) };
  } catch (error) {
    throw mapHttpError(error, 'waporClient');
  }
}
