import type { Response } from 'express';

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function parseDurationToMs(duration: string | undefined, defaultMs: number): number {
  if (!duration) return defaultMs;
  const match = duration.match(/^(\d+)([smhd])?$/);
  if (!match) return defaultMs;
  const value = parseInt(match[1], 10);
  const unit = match[2] ?? 's';
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return defaultMs;
  }
}

export function getCookieDomain(req: { headers: Record<string, string | string[] | undefined> }): string | undefined {
  const host = String(req.headers['host'] ?? '').split(':')[0];
  if (host === 'localhost' || host === '127.0.0.1') return undefined;
  const parts = host.split('.');
  return parts.length >= 2 ? '.' + parts.slice(-2).join('.') : undefined;
}

export function setAuthCookies(
  req: { headers: Record<string, string | string[] | undefined> },
  res: Response,
  accessToken: string,
  refreshToken: string,
  refreshExpiresAt: Date,
  accessExpiresStr = '15m',
): void {
  const domain = getCookieDomain(req);
  const isLocalhost = !domain;
  const sameSite = isLocalhost ? ('lax' as const) : ('none' as const);
  const opts = { ...COOKIE_DEFAULTS, domain, sameSite, secure: !isLocalhost, path: '/' };
  const accessMaxAge = parseDurationToMs(accessExpiresStr, 15 * 60 * 1000);

  // Clear any legacy restricted-path cookie first
  res.clearCookie('refresh_token', { ...opts, path: '/auth/refresh' });
  res.cookie('access_token', accessToken, { ...opts, maxAge: accessMaxAge });
  res.cookie('refresh_token', refreshToken, { ...opts, maxAge: refreshExpiresAt.getTime() - Date.now() });
}

export function setAccessTokenCookie(
  req: { headers: Record<string, string | string[] | undefined> },
  res: Response,
  accessToken: string,
  accessExpiresStr = '15m',
): void {
  const domain = getCookieDomain(req);
  const isLocalhost = !domain;
  const sameSite = isLocalhost ? ('lax' as const) : ('none' as const);
  const opts = { ...COOKIE_DEFAULTS, domain, sameSite, secure: !isLocalhost, path: '/' };
  const accessMaxAge = parseDurationToMs(accessExpiresStr, 15 * 60 * 1000);

  res.cookie('access_token', accessToken, { ...opts, maxAge: accessMaxAge });
}

export function clearAuthCookies(
  req: { headers: Record<string, string | string[] | undefined> },
  res: Response,
): void {
  const domain = getCookieDomain(req);
  const isLocalhost = !domain;
  const sameSite = isLocalhost ? ('lax' as const) : ('none' as const);
  const opts = { ...COOKIE_DEFAULTS, domain, sameSite, secure: !isLocalhost, path: '/' };
  res.clearCookie('access_token', { ...opts });
  res.clearCookie('refresh_token', { ...opts });
  res.clearCookie('refresh_token', { ...opts, path: '/auth/refresh' });
}
