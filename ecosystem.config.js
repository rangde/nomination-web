module.exports = {
  apps: [
    {
      name: 'josh-production',
      cwd: '/home/deploy/apps/nomination-web',
      script: 'node_modules/next/dist/bin/next',
      interpreter: '/home/deploy/.nvm/versions/node/v20.20.1/bin/node',
      args: 'start -p 3000',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'https://rdb-prod.m.frappe.cloud',
      },
    },
    {
      name: 'josh-staging',
      cwd: '/home/deploy/apps/nomination-web',
      script: 'node_modules/next/dist/bin/next',
      interpreter: '/home/deploy/.nvm/versions/node/v20.20.1/bin/node',
      args: 'start -p 3001',
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3001,
        BACKEND_URL: 'https://rdb-staging.m.frappe.cloud',
      },
    },
  ],
};
