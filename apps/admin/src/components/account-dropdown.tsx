'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

interface AccountDropdownProps {
  className?: string;
}

export function AccountDropdown({ className }: AccountDropdownProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const user = useAdminAuthStore((s) => s.user);
  const logout = useAdminAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar with Online Dot */}
        <div className="relative flex-shrink-0">
          <span className="flex size-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-bold ring-1 ring-border overflow-hidden">
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt={user.name} className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </div>

        {/* User Info (Hidden on very small mobile) */}
        <div className="hidden sm:block text-left max-w-[120px] md:max-w-[150px]">
          <span className="block text-xs font-semibold text-foreground leading-tight truncate">
            {user.name}
          </span>
          <span className="block text-[0.68rem] text-muted-foreground leading-tight truncate">
            {user.email}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform duration-150 hidden sm:block',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-xl shadow-black/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.62rem] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="size-2.5" />
                {user.role}
              </span>
            </div>
            <p className="text-[0.72rem] text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Quick Menu */}
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/users/${user.id}`);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-xl transition-colors text-left"
            >
              <User className="size-3.5 text-muted-foreground" />
              <span>{t('profile')}</span>
            </button>
          </div>

          <div className="p-1 border-t border-border/60">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
            >
              <LogOut className="size-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
