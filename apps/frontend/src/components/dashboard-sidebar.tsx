'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Bell, Settings, Shield, ChevronRight,
} from 'lucide-react';
import { Logo } from '@ahansk/ui';
import { AccountDropdown } from '@/components/account-dropdown';
import { cn } from '@/lib/cn';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  children?: { key: string; href: string }[];
}

const useNavItems = (base: string): NavItem[] => [
  { key: 'dashboard',     href: base,                   icon: <LayoutDashboard className="size-4" /> },
  { key: 'notifications', href: `${base}/notifications`, icon: <Bell className="size-4" /> },
  {
    key: 'settings', href: `${base}/settings`, icon: <Settings className="size-4" />,
    children: [
      { key: 'settings',  href: `${base}/settings` },
      { key: 'security',  href: `${base}/settings/security` },
    ],
  },
];

interface DashboardSidebarProps {
  dashboardPath: string;
}

export function DashboardSidebar({ dashboardPath }: DashboardSidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const navItems = useNavItems(dashboardPath);

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card w-60">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-border flex-shrink-0">
        <Link href={dashboardPath}>
          <Logo height={30} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.href === dashboardPath);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent',
                )}
              >
                {item.icon}
                <span className="flex-1">{t(item.key)}</span>
                {hasChildren && <ChevronRight className="size-3.5 opacity-50" />}
              </Link>

              {/* Sub-items */}
              {hasChildren && isActive(item.href) && (
                <div className="ml-4 mt-0.5 pl-3 border-l border-border space-y-0.5">
                  {item.children!.map((child) => (
                    <Link
                      key={child.key}
                      href={child.href}
                      className={cn(
                        'block rounded-md px-3 py-2 text-xs font-medium transition-colors',
                        pathname === child.href
                          ? 'text-primary bg-primary/5'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      {t(child.key)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

    </aside>
  );
}
