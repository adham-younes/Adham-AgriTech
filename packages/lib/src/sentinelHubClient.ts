import { fetchWithRetry } from './http';

export async function getSentinelNdviPreview(aoiGeoJson: object) {
  const token = process.env.SENTINEL_HUB_ACCESS_TOKEN ?? '';
  const res = await fetchWithRetry('https://services.sentinel-hub.com/api/v1/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      input: { bounds: { geometry: aoiGeoJson }, data: [{ type: 'sentinel-2-l2a' }] },
      output: { width: 256, height: 256, responses: [{ identifier: 'default', format: { type: 'image/png' } }] },
      evalscript: '//VERSION=3\nfunction setup(){return {input:["B04","B08"],output:{bands:1}};}\nfunction evaluatePixel(s){return [(s.B08-s.B04)/(s.B08+s.B04)];}'
    })
  });
  return res.arrayBuffer();
}
