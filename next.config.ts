import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8003';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      //for api
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },

      //for files
      {
        source: '/files/:path*',
        destination: `${backendUrl}/files/:path*`,
      },
    ];
  },
};

export default nextConfig;
