import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Builds the login URL with a return path ('next' query param).
 * Avoids setting 'next' if already on a login page or root.
 */
export function getLoginUrl(returnPath?: string): string {
  if (!returnPath || returnPath === '/' || returnPath.startsWith('/login')) {
    return '/login';
  }
  return `/login?next=${encodeURIComponent(returnPath)}`;
}

/**
 * Redirects to the login page using Next.js App Router, preserving the current return path.
 */
export function redirectToLogin(router: AppRouterInstance, returnPath?: string): void {
  const target = getLoginUrl(returnPath);
  router.push(target);
}
