'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@ahansk/ui';
import { useAdminAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

interface NavGroup {
  labelKey: string;
  items: {
    href: string;
    icon: typeof LayoutDashboard;
    labelKey: string;
    badgeKey?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'overview',
    items: [
      { href: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
    ],
  },
  {
    labelKey: 'management',
    items: [
      { href: '/users', icon: Users, labelKey: 'users' },
      { href: '/news', icon: Newspaper, labelKey: 'news' },
    ],
  },
  {
    labelKey: 'communications',
    items: [
      { href: '/notifications', icon: Bell, labelKey: 'notifications' },
    ],
  },
  {
    labelKey: 'system',
    items: [
      { href: '/settings', icon: Settings, labelKey: 'settings' },
    ],
  },
];

interface SidebarContentProps {
  onNav?: () => void;
}

export function SidebarContent({ onNav }: SidebarContentProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const logout = useAdminAuthStore((s) => s.logout);
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? '/';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5">
          <Logo frontendUrl={frontendUrl} width={96} height={24} />
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="size-3" />
            Admin
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="space-y-1">
            <p className="px-3 text-[0.68rem] font-bold tracking-wider uppercase text-muted-foreground/70">
              {t(group.labelKey)}
            </p>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNav}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border shrink-0 space-y-1">
        <a
          href={frontendUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5" />
            View Live Site
          </span>
          <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            Web
          </span>
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-3.5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 w-[var(--sidebar-w)]">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Sheet) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative flex flex-col w-72 max-w-[80vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            <SidebarContent onNav={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
