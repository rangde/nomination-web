import type { NextConfig } from 'next';

const backendUrl = 'http://127.0.0.1:8005';

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
