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

const dotenv = require('dotenv');

// Load environment variables for each app explicitly
const apiEnv = dotenv.config({ path: './apps/api/.env' }).parsed || {};
const webEnv = dotenv.config({ path: './apps/web/.env' }).parsed || {};
const adminEnv = dotenv.config({ path: './apps/admin/.env' }).parsed || {};

module.exports = {
  apps: [
    // ─────────────────────────────────────────────────────────────
    // Backend API  →  api.ahansk.com
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-api',
      cwd:                './apps/api',
      script:             'dist/main.js',
      instances:          2,
      exec_mode:          'cluster',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: apiEnv.PORT || 10311,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Web User-Facing  →  ahansk.com  (or your domain)
    // ─────────────────────────────────────────────────────────────
    {
      name:               'ahansk-web',
      cwd:                './apps/web',
      script:             'node_modules/next/dist/bin/next',
      args:               'start',
      interpreter:        'node',
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: webEnv.PORT || 10312,
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
        PORT: adminEnv.PORT || 10313,
      },
    },
  ],
};
