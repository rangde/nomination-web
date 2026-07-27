module.exports = {
  apps: [
    {
      name: 'odisha-staging',
      cwd: '/home/deploy/apps/nomination-web-odisha',
      script: 'node_modules/next/dist/bin/next',
      interpreter: '/home/deploy/.nvm/versions/node/v20.20.1/bin/node',
      args: 'start -p 3002',
      env_staging: {
        NODE_ENV: 'production',
        PORT: 3002,
        BACKEND_URL: 'https://rdb-staging.m.frappe.cloud',
      },
    },
  ],
};
