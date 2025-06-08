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
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;

const API_URL = "https://localhost:7177";

export { API_URL };