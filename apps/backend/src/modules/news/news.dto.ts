import { z } from 'zod';

const slug = /^[a-z0-9-]+$/;

export const CreateNewsSchema = z.object({
  title:        z.string().min(3).max(255),
  slug:         z.string().min(3).max(255).regex(slug),
  content:      z.string().min(1),
  type:         z.enum(['ANNOUNCEMENT', 'UPDATE', 'MAINTENANCE']).default('ANNOUNCEMENT'),
  is_published: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  is_pinned:    z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(false),
  published_at: z.coerce.date().optional().nullable(),
  expires_at:   z.coerce.date().optional().nullable(),
});

export const UpdateNewsSchema = CreateNewsSchema.partial();

export const ListNewsQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(10),
  type:   z.enum(['ANNOUNCEMENT', 'UPDATE', 'MAINTENANCE']).optional(),
  pinned: z.preprocess((v) => v === 'true', z.boolean()).optional(),
});

export type CreateNewsDto      = z.infer<typeof CreateNewsSchema>;
export type UpdateNewsDto      = z.infer<typeof UpdateNewsSchema>;
export type ListNewsQueryDto   = z.infer<typeof ListNewsQuerySchema>;
