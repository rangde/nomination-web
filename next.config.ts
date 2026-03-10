import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      //for api
      {
        source: '/api/:path*',
        destination: 'https://rdb-staging.m.frappe.cloud/api/:path*',
      },

      //for files
      {
        source: '/files/:path*',
        destination: 'https://rdb-staging.m.frappe.cloud/files/:path*',
      },
    ];
  },
};

export default nextConfig;
