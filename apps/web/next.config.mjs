/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async headers() {
    const marketingCache = { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' };
    return [
      { source: '/', headers: [marketingCache] },
      { source: '/about', headers: [marketingCache] },
      { source: '/pricing', headers: [marketingCache] },
      { source: '/contact', headers: [marketingCache] },
      { source: '/docs', headers: [marketingCache] },
      { source: '/docs/:slug*', headers: [marketingCache] },
      {
        source: '/app/reports',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=3600' }]
      }
    ];
  }
};

export default nextConfig;
