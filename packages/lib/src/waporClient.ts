import { fetchWithRetry } from './http';

export async function getWaporWaterProductivity(country = 'EGY') {
  const base = process.env.WAPOR_BASE_URL ?? 'https://data.apps.fao.org/gismgr/api/v2';
  const res = await fetchWithRetry(`${base}/catalog/workspaces/WAPOR-3/mosaicsets`);
  const json = await res.json();
  return { country, source: 'WaPOR v3', payload: json };
}
