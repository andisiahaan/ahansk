'use client';

import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onPageChange?: (page: number) => void;
  total?: number;
  limit?: number;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', total];
  }

  if (current >= total - 3) {
    return [1, 'ellipsis', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total];
}

export function Pagination({
  page,
  totalPages,
  hasPrev = page > 1,
  hasNext = page < totalPages,
  onPrev,
  onNext,
  onPageChange,
  total,
  limit,
  className,
}: PaginationProps) {
  const t = useTranslations('common');
  const [jumpInput, setJumpInput] = useState('');

  if (totalPages <= 1) return null;

  const from = limit ? (page - 1) * limit + 1 : undefined;
  const to = limit && total ? Math.min(page * limit, total) : undefined;

  const goTo = (target: number) => {
    if (target === page || target < 1 || target > totalPages) return;
    if (onPageChange) {
      onPageChange(target);
    } else if (target < page && onPrev) {
      onPrev();
    } else if (target > page && onNext) {
      onNext();
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      goTo(parsed);
      setJumpInput('');
    }
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40 text-xs sm:text-sm', className)}>
      {/* Summary Info */}
      <p className="text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
        {from && to && total
          ? t('pagination.showing', { from, to, total })
          : t('pagination.pageOf', { page, totalPages })}
      </p>

      {/* Controls: Prev/Next, Numbers, Jump */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 sm:order-2">
        {/* Prev Button */}
        <button
          disabled={!hasPrev}
          onClick={() => goTo(page - 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={t('pagination.previous')}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden md:inline">{t('pagination.previous')}</span>
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-muted-foreground select-none">
                  …
                </span>
              );
            }

            const isActive = item === page;
            return (
              <button
                key={item}
                onClick={() => goTo(item)}
                className={cn(
                  'min-w-8 h-8 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm font-semibold'
                    : 'bg-card hover:bg-muted text-foreground border-border'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={!hasNext}
          onClick={() => goTo(page + 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={t('pagination.next')}
        >
          <span className="hidden md:inline">{t('pagination.next')}</span>
          <ChevronRight className="size-4" />
        </button>

        {/* Jump To Page Form */}
        {totalPages > 1 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2 pl-2 border-l border-border/60">
            <span className="text-xs text-muted-foreground hidden lg:inline">{t('pagination.goToPage')}:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={`${page}`}
              className="w-12 h-8 px-1.5 text-center text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!jumpInput}
              className="h-8 px-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('pagination.go')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface DataTableProps {
  children: ReactNode;
}

export function DataTable({ children }: DataTableProps) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
