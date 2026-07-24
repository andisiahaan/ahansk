'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Bell, Settings, Menu, X } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { AccountDropdown } from '@/components/account-dropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@ahansk/ui';
import { cn } from '@/lib/cn';

interface DashboardShellProps {
  children: React.ReactNode;
  dashboardPath: string;
}

interface BottomNavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
}

function useBottomNavItems(base: string): BottomNavItem[] {
  return [
    { key: 'dashboard',     href: base,                   icon: <LayoutDashboard className="size-5" /> },
    { key: 'notifications', href: `${base}/notifications`, icon: <Bell className="size-5" /> },
    { key: 'settings',      href: `${base}/settings`,      icon: <Settings className="size-5" /> },
  ];
}

export function DashboardShell({ children, dashboardPath }: DashboardShellProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bottomNavItems = useBottomNavItems(dashboardPath);

  const isActive = (href: string) =>
    href === dashboardPath ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Sidebar — Desktop only */}
      <div className="hidden lg:flex flex-shrink-0">
        <DashboardSidebar dashboardPath={dashboardPath} />
      </div>

      {/* Top bar (Desktop & Mobile) */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <header className="flex h-14 items-center justify-between px-4 sm:px-6 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center">
            {/* Logo only visible on mobile */}
            <div className="lg:hidden">
              <Link href={dashboardPath}>
                <Logo height={28} />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountDropdown />
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t('openMenu')}
              className="lg:hidden inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>

        {/* Mobile drawer overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
              <div className="flex h-full flex-col shadow-2xl">
                <div className="flex h-14 items-center justify-between px-4 border-b border-border bg-card">
                  <Logo height={28} />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label={t('closeMenu')}
                    className="inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DashboardSidebar dashboardPath={dashboardPath} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex-shrink-0 border-t border-border bg-card px-2 pb-safe">
          <div className="flex items-center justify-around">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-3 text-[0.6rem] font-medium transition-colors min-w-[60px]',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <span className={cn('transition-transform', active && 'scale-110')}>{item.icon}</span>
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
