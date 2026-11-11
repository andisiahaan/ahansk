import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { localeRegistry, type SupportedLocale } from '@ahansk/shared';

export const SUPPORTED_LOCALES = Object.keys(localeRegistry) as SupportedLocale[];
export const DEFAULT_LOCALE: SupportedLocale = 'en';
export type Locale = SupportedLocale;

/**
 * Builds the next-intl message tree for the authenticated app.
 *
 * Locale is resolved from the `locale` cookie (set by middleware).
 * Messages are merged from shared packages:
 *  - modules (auth, common, notifications)
 *  - frontend (nav, dashboard, account)
 */
export default getRequestConfig(async () => {
  let locale: Locale = DEFAULT_LOCALE;
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('locale')?.value;
    if ((SUPPORTED_LOCALES as string[]).includes(raw ?? '')) {
      locale = raw as Locale;
    }
  } catch {
    // cookies() throws in static pages like not-found
  }

  const { modules, frontend } = localeRegistry[locale];

  return {
    locale,
    messages: {
      auth: modules.auth,
      common: modules.common,
      notifications: modules.notifications,
      nav: frontend.nav,
      dashboard: frontend.dashboard,
      account: frontend.account,
    },
  };
});

