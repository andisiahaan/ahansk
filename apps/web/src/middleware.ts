import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/i18n/request';

const LEGACY_AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:10314').replace(/\/+$/, '');

  // Redirect legacy auth routes to apps/app
  for (const route of LEGACY_AUTH_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const targetSubPath = pathname.replace(/^\//, '');
      const url = new URL(`${appUrl}/auth/${targetSubPath}`);
      req.nextUrl.searchParams.forEach((val, key) => url.searchParams.set(key, val));
      return NextResponse.redirect(url);
    }
  }

  // Redirect legacy dashboard routes to apps/app
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const subPath = pathname.replace(/^\/dashboard/, '');
    const url = new URL(`${appUrl}${subPath || '/'}`);
    req.nextUrl.searchParams.forEach((val, key) => url.searchParams.set(key, val));
    return NextResponse.redirect(url);
  }

  // ─── Set locale cookie if missing ──────────────────────────────────────────
  const response = NextResponse.next();
  if (!req.cookies.has('locale')) {
    const acceptLang = req.headers.get('accept-language') ?? '';
    const preferred = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() ?? '';
    const locale = (SUPPORTED_LOCALES as readonly string[]).includes(preferred)
      ? preferred
      : DEFAULT_LOCALE;
    response.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
