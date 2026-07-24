'use client';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { useAdminAuthStore } from '@/stores/auth.store';
import { AccountDropdown } from '@/components/account-dropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const PUBLIC_PATHS = ['/auth'];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) return <>{children}</>;
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, fetchMe } = useAdminAuthStore();
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    // Verify session via API — middleware already blocked unauthenticated requests,
    // this is a secondary check to populate user state and verify ADMIN role.
    fetchMe().then(() => {
      if (!useAdminAuthStore.getState().user) router.replace('/auth/login');
    });
  }, [fetchMe, router]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="text-sm text-muted-foreground animate-pulse">Loading…</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 md:ml-[var(--sidebar-w)]">
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border bg-card">
          <span className="font-semibold text-sm text-foreground ml-12 md:ml-0">Admin Panel</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountDropdown />
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
