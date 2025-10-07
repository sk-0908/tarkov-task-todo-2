import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.tarkov.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
