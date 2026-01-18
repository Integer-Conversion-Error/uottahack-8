import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:4000/images/:path*',
      },
      {
        source: '/audio/:path*',
        destination: 'http://localhost:4000/audio/:path*',
      },
    ];
  },
};

export default nextConfig;
