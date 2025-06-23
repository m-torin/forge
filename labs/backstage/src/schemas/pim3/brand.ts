import { z } from 'zod';
import { BrandType, ContentStatus } from '@repo/database/prisma';

export const brandFormSchema = z.object({
  // Basic information
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.nativeEnum(BrandType),
  status: z.nativeEnum(ContentStatus),
  baseUrl: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL' },
    )
    .transform((val) => val || ''),
  parentId: z
    .string()
    .optional()
    .transform((val) => val || ''),
  displayOrder: z.number().min(0).default(0),

  // Content
  copy: z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Copy must be valid JSON' },
  ),

  // Relationships
  productIds: z.array(z.string()).default([]),
  collectionIds: z.array(z.string()).default([]),
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;
