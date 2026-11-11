'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, Bell, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, exact: true },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Account', href: '/account', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-card/95 backdrop-blur-md border-t border-border/80 z-40 px-3 pb-safe">
      <div className="h-full max-w-lg mx-auto flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('size-5', isActive && 'stroke-[2.5]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

