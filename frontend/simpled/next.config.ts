import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;

const API_URL = 'https://backend-simpled.duckdns.org';

export { API_URL };
