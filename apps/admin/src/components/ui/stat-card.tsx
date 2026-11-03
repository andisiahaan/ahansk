'use client';

import Link from 'next/link';
import { type LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'success' | 'primary' | 'warning' | 'muted';
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
  badgeVariant = 'primary',
  href,
  className,
}: StatCardProps) {
  const cardBody = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        href && 'cursor-pointer',
        className
      )}
    >
      {/* Background ambient gradient flare */}
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-5" />
        </div>

        {badge && (
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold tracking-wide uppercase',
              badgeVariant === 'success' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
              badgeVariant === 'primary' && 'bg-primary/10 text-primary border border-primary/20',
              badgeVariant === 'warning' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
              badgeVariant === 'muted' && 'bg-muted text-muted-foreground border border-border/60'
            )}
          >
            {badge}
          </span>
        )}

        {href && (
          <span className="text-muted-foreground/60 group-hover:text-primary transition-colors">
            <ArrowUpRight className="size-4" />
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-xs font-semibold text-foreground/80">{title}</div>
        {description && (
          <div className="text-[0.72rem] text-muted-foreground line-clamp-1">{description}</div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{cardBody}</Link>;
  }

  return cardBody;
}

