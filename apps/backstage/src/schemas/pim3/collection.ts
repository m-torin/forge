import { z } from 'zod';
import { CollectionType, ContentStatus } from '@repo/database/prisma';

export const collectionFormSchema = z.object({
  // Basic information
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.nativeEnum(CollectionType),
  status: z.nativeEnum(ContentStatus),
  displayOrder: z.number().min(0).default(0),

  // Content
  shortDescription: z.string().optional().default(''),
  longDescription: z.string().optional().default(''),
  copy: z
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
      { message: 'Copy must be valid JSON' },
    )
    .default('{}'),

  // SEO
  metaTitle: z.string().max(60).optional().default(''),
  metaDescription: z.string().max(160).optional().default(''),

  // Display settings
  featuredImageUrl: z.string().url().optional().or(z.literal('')).default(''),

  // Relationships
  productIds: z.array(z.string()).default([]),
  parentId: z.string().optional().default(''),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
