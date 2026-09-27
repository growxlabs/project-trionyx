module.exports = {
  apps: [
    {
      name: 'trionyx-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'trionyx-dealer',
      cwd: './apps/dealer',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3001',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'trionyx-portal',
      cwd: './apps/portal',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port 3002',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
  ],
};
