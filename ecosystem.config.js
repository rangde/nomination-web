module.exports = {
  apps: [
    {
      name: 'josh-production',
      cwd: '/var/www/josh',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'https://rdb-prod.m.frappe.cloud',
      },
    },
    {
      name: 'josh-staging',
      cwd: '/var/www/josh',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3001,
        BACKEND_URL: 'https://rdb-staging.m.frappe.cloud',
      },
    },
  ],
};
