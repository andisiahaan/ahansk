import modulesAuth from './modules/auth.json';
import modulesCommon from './modules/common.json';

import modulesNotifications from './modules/notifications.json';

import frontendNav from './frontend/nav.json';

import frontendDashboard from './frontend/dashboard.json';
import frontendAccount from './frontend/account.json';

import adminNav from './admin/nav.json';
import adminDashboard from './admin/dashboard.json';

import adminUsers from './admin/users.json';
import adminNews from './admin/news.json';
import adminSettings from './admin/settings.json';
import adminNotifications from './admin/notifications.json';

/**
 * English locale data — structured by layer:
 *  - modules/  : cross-app strings, identical in all apps
 *  - frontend/ : strings specific to the user-facing frontend app
 *  - admin/    : strings specific to the admin dashboard app
 *
 * To add a new module, add the JSON file under modules/ and re-export here.
 * To add a new app, create its subfolder and re-export here.
 */
export const en = {
  modules: {
    auth:          modulesAuth,
    common:        modulesCommon,

    notifications: modulesNotifications,
  },
  frontend: {
    nav:       frontendNav,

    dashboard: frontendDashboard,
    account:   frontendAccount,
  },
  admin: {
    nav:           adminNav,
    dashboard:     adminDashboard,

    users:         adminUsers,
    news:          adminNews,
    settings:      adminSettings,
    notifications: adminNotifications,
  },
} as const;
