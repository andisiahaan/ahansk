export interface DiskConfig {
  fieldName: string;
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
  maxSizeBytes: number;
  prefix: string;
}

export const DISK_CONFIGS = {
  avatar: {
    fieldName: 'avatar',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    prefix: 'avatars',
  },
  blog_cover: {
    fieldName: 'cover_image',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    prefix: 'blog',
  },
  ticket_attachment: {
    fieldName: 'attachment',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    prefix: 'tickets',
  },
} as const satisfies Record<string, DiskConfig>;

export type DiskContext = keyof typeof DISK_CONFIGS;
