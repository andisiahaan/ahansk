import { z } from 'zod';

export const CreatePatSchema = z.object({
  name:       z.string().min(1).max(100),
  expires_at: z.coerce.date().optional().nullable(),
});

export type CreatePatDto = z.infer<typeof CreatePatSchema>;
