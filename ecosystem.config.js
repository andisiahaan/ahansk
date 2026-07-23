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
        PORT:     10311,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Frontend  →  ahansk.com  (or your domain)
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-frontend',
      cwd:                './apps/frontend',
      script:             'node_modules/next/dist/bin/next',
      args:               'start',
      interpreter:        'node',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     10312,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Admin Panel  →  admin.ahansk.com
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-admin',
      cwd:                './apps/admin',
      script:             'node_modules/next/dist/bin/next',
      args:               'start',
      interpreter:        'node',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT:     10313,
      },
    },
  ],
};
