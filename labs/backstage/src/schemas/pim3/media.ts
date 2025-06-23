import { z } from 'zod';
import { MediaType } from '@repo/database/prisma';

export const mediaFormSchema = z.object({
  // Basic information
  name: z.string().min(1, 'Name is required'),
  alt: z.string().min(1, 'Alt text is required for accessibility'),
  type: z.nativeEnum(MediaType),
  mimeType: z.string().optional().default(''),

  // File information
  url: z.string().url('Invalid URL').optional().or(z.literal('')).default(''),
  size: z.number().min(0).optional().default(0),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),

  // Metadata
  caption: z.string().optional().default(''),
  credit: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  metadata: z
    .string()
    .refine(
      (value) => {
        if (!value || value === '{}') return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Metadata must be valid JSON' },
    )
    .default('{}'),

  // Relationships
  productIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type MediaFormValues = z.infer<typeof mediaFormSchema>;
