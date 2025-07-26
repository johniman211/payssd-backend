module.exports = {
  apps: [
    {
      name: 'payssd-backend',
      script: 'index.js',
      cwd: './', // Current working dir (backend)
      instances: 1, // Or "max" to auto-scale
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
