'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, ChevronDown } from 'lucide-react';
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-muted transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
          {initials}
        </span>
        <span className="hidden lg:block text-left">
          <span className="block text-xs font-semibold text-foreground leading-tight">{user.name}</span>
          <span className="block text-[0.65rem] text-muted-foreground leading-tight">{user.email}</span>
        </span>
        <ChevronDown className={cn('size-3.5 text-muted-foreground transition-transform hidden lg:block', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-xl shadow-black/10 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <p className="text-[0.65rem] uppercase tracking-wider text-primary mt-1 font-bold">{user.role}</p>
          </div>

          <div className="py-1 border-t border-border flex items-center justify-between px-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-1"
            >
              <LogOut className="size-4" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
