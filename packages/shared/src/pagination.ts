import { z } from 'zod';

// ─── Pagination Query Params ───────────────────────────────────────────────────
export const PaginationQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort:  z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ─── Pagination Meta ───────────────────────────────────────────────────────────
export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ─── Paginated Response Shape ──────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  meta:  PaginationMeta;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
