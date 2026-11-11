'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@ahansk/ui';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { AccountDropdown } from '@/components/account-dropdown';
import { NotificationBell } from '@/components/notification-bell';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

interface AppShellProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/auth'];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    return <>{children}</>;
  }

  return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}

function AuthenticatedAppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <div className="flex h-dvh bg-background text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar (Collapsible) */}
      <div className={cn('hidden lg:flex shrink-0 transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Main Body */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top bar (Mobile & Desktop) */}
        <header className="h-16 w-full flex items-center justify-between border-b border-border/80 bg-card/80 backdrop-blur-md px-4 sm:px-6 shrink-0 z-30">
          {/* Left: Mobile Drawer Trigger + Brand */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open Navigation Drawer"
              className="lg:hidden inline-flex items-center justify-center size-10 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Logo height={26} />
              <span className="font-extrabold text-sm tracking-tight text-foreground lg:hidden">
                Ahansk <span className="text-primary">Hub</span>
              </span>
            </Link>
          </div>

          {/* Right: Language Switcher, Theme Toggle, Notifications & Account */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
            <AccountDropdown />
          </div>
        </header>

        {/* Mobile Drawer (Overlay & Slide-in) */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-card shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="h-16 px-4 flex items-center justify-between border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Logo height={26} />
                  <span className="font-extrabold text-sm tracking-tight">Ahansk Hub</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close Drawer"
                  className="size-9 inline-flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AppSidebar
                  collapsed={false}
                  onToggleCollapse={() => {}}
                  onNav={() => setMobileDrawerOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Container (Mobile-First padding with pb-24 for bottom nav) */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 pb-24 lg:pb-8">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation (Mobile Only, 64px, pb-safe) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

