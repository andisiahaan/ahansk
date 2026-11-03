'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, ShieldAlert, LogOut, ChevronRight } from 'lucide-react';
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
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { user, fetchMe, logout } = useAdminAuthStore();
  const hydrated = useRef(false);
  const [error, setError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    fetchMe().then(() => {
      if (!useAdminAuthStore.getState().user) setError(true);
    });
  }, [fetchMe, router]);

  // Derive current section label for breadcrumb
  const currentSection = pathname === '/'
    ? t('dashboard')
    : pathname.startsWith('/users')
      ? t('users')
      : pathname.startsWith('/news')
        ? t('news')
        : pathname.startsWith('/notifications')
          ? t('notifications')
          : pathname.startsWith('/settings')
            ? t('settings')
            : t('admin_panel');

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 ring-1 ring-destructive/20">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">{t('access_denied')}</h1>
        <p className="text-muted-foreground text-xs mb-6 max-w-sm leading-relaxed">
          {t('access_denied_desc')}
        </p>
        <button
          type="button"
          onClick={() => {
            logout().finally(() => {
              fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                window.location.href = '/auth/login';
              });
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <LogOut className="size-4" />
          {t('sign_out_switch')}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar with Desktop + Mobile Sheet */}
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-[var(--sidebar-w)]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 h-16 border-b border-border/80 bg-card/80 backdrop-blur-md">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center size-9 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground hidden sm:inline">{t('admin_panel')}</span>
              <ChevronRight className="size-3 text-muted-foreground hidden sm:inline" />
              <span className="font-semibold text-foreground text-sm tracking-tight">{currentSection}</span>
            </div>
          </div>

          {/* Right: API Status Badge + Theme Toggle + Account */}
          <div className="flex items-center gap-2.5">
            {/* Live API Health indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span>{t('api_online')}</span>
            </div>

            <ThemeToggle />
            <AccountDropdown />
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-x-hidden w-full">{children}</main>
      </div>
    </div>
  );
}
