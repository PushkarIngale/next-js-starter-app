import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["fluffy-space-waffle-qgj4wg7p57g3469q-3000.app.github.dev",'*','https://fluffy-space-waffle-qgj4wg7p57g3469q-3000.app.github.dev/'],
    }
  },
};

export default nextConfig;
