'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@ahansk/ui';
import {
  LayoutDashboard,
  Newspaper,
  Bell,
  User,
  Shield,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth.store';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNav?: () => void;
}

const MENU_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Security', href: '/account/security', icon: Shield },
  { label: 'Preferences', href: '/account/notification-preferences', icon: Sliders },
];

export function AppSidebar({ collapsed, onToggleCollapse, onNav }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className={cn(
        'h-full flex flex-col border-r border-border/80 bg-card transition-all duration-300 select-none',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/80 shrink-0">
        <Link
          href="/"
          onClick={onNav}
          className={cn(
            'flex items-center gap-2.5 overflow-hidden transition-all',
            collapsed ? 'justify-center w-full' : '',
          )}
        >
          <Logo height={28} />
          {!collapsed && (
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Ahansk{' '}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Hub
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group min-h-[44px]',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                collapsed ? 'justify-center px-0' : '',
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User profile & actions footer */}
      <div className="p-3 border-t border-border/80 shrink-0 space-y-2">
        {!collapsed && user && (
          <div className="px-2 py-1.5 rounded-lg bg-muted/40 text-xs">
            <p className="font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => logout()}
            title="Log Out"
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer min-h-[40px]',
              collapsed ? 'w-full justify-center' : '',
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:inline-flex items-center justify-center size-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

