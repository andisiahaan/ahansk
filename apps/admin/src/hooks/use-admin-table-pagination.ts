'use client';

import { useCallback, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface UseAdminTablePaginationReturn {
  page: number;
  setPage: (newPage: number) => void;
  onPageChange: (newPage: number) => void;
  resetPage: () => void;
  isPending: boolean;
}

/**
 * Custom hook to synchronize admin table pagination with URL query string (`?page=`).
 * Maintains browser history, bookmarking, and preserves all other query parameters.
 */
export function useAdminTablePagination(): UseAdminTablePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const rawPage = searchParams.get('page');
  const parsed = rawPage ? parseInt(rawPage, 10) : 1;
  const page = isNaN(parsed) || parsed < 1 ? 1 : parsed;

  const setPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, newPage);
      const params = new URLSearchParams(searchParams.toString());

      if (validPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', validPage.toString());
      }

      const qs = params.toString();
      const target = qs ? `${pathname}?${qs}` : pathname;

      startTransition(() => {
        router.push(target, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has('page')) return;
    params.delete('page');
    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.push(target, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  return {
    page,
    setPage,
    onPageChange: setPage,
    resetPage,
    isPending,
  };
}
