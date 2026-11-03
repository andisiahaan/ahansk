'use client';

import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface UsersFilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  isActiveStr: string;
  setIsActiveStr: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  order: string;
  setOrder: (v: string) => void;
  resetPage: () => void;
}

export function UsersFilterBar({
  search,
  setSearch,
  role,
  setRole,
  isActiveStr,
  setIsActiveStr,
  sortBy,
  setSortBy,
  order,
  setOrder,
  resetPage,
}: UsersFilterBarProps) {
  const t = useTranslations('users');
  const hasActiveFilters = Boolean(search || role || isActiveStr);

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setIsActiveStr('');
    resetPage();
  };

  return (
    <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Input */}
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

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">{t('filters.allRoles')}</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>

          <select
            value={isActiveStr}
            onChange={(e) => {
              setIsActiveStr(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="true">{t('filters.active')}</option>
            <option value="false">{t('filters.disabled')}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              resetPage();
            }}
            className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            <option value="created_at">{t('filters.sortByJoined')}</option>
            <option value="name">{t('filters.sortByName')}</option>
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

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

