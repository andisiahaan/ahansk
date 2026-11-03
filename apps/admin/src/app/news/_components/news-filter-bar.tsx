'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

interface NewsFilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  order: string;
  setOrder: (v: string) => void;
  resetPage: () => void;
}

export function NewsFilterBar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  order,
  setOrder,
  resetPage,
}: NewsFilterBarProps) {
  const t = useTranslations('news');

  return (
    <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                resetPage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">{t('filters.allTypes')}</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="UPDATE">Update</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="PUBLISHED">{t('filters.published')}</option>
            <option value="DRAFT">{t('filters.draft')}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="published_at">{t('filters.sortByPublish')}</option>
            <option value="title">{t('filters.sortByTitle')}</option>
          </select>

          <select
            value={order}
            onChange={(e) => {
              setOrder(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="desc">{t('filters.descending')}</option>
            <option value="asc">{t('filters.ascending')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

