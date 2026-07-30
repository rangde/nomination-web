import type { NextConfig } from 'next';

// Trailing slashes would produce a double slash in the rewrite destination
// (`host//api/...`), which the backend does not route.
const backendUrl = (process.env.BACKEND_URL || 'http://localhost:8003').replace(
  /\/+$/,
  ''
);

if (!process.env.BACKEND_URL) {
  console.warn(
    `BACKEND_URL is not set — /api and /files rewrites fall back to ${backendUrl}. ` +
      `If nothing is listening there, every proxied request returns a plain-text 500 from Next.`
  );
}

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
