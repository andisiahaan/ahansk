/**
 * PM2 Ecosystem Config — Ahansk Monorepo
 *
 * Usage:
 *   First deploy  : pm2 start ecosystem.config.js --env production
 *   Update        : pm2 reload ecosystem.config.js --env production
 *   Status        : pm2 status
 *   Logs          : pm2 logs [app-name]
 *   Save on reboot: pm2 save && pm2 startup
 */

module.exports = {
  apps: [
    // ─────────────────────────────────────────────────────────────
    // Backend API  →  api.ahansk.com
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-backend',
      cwd:                './apps/backend',
      script:             'dist/main.js',
      instances:          '1',
      exec_mode:          'cluster',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     10001,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Frontend  →  ahansk.com  (or your domain)
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-frontend',
      cwd:                './apps/frontend',
      script:             'node_modules/.bin/next',
      args:               'start',
      interpreter:        'none',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     10002,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Admin Panel  →  admin.ahansk.com
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-admin',
      cwd:                './apps/admin',
      script:             'node_modules/.bin/next',
      args:               'start',
      interpreter:        'none',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     10003,
      },
    },
  ],
};
