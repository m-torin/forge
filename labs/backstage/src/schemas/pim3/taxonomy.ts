import { z } from 'zod';
import { ContentStatus, TaxonomyType } from '@repo/database/prisma';

export const taxonomyFormSchema = z.object({
  // Basic information
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.nativeEnum(TaxonomyType),
  status: z.nativeEnum(ContentStatus),
  parentId: z.string().optional().default(''),
  displayOrder: z.number().min(0).default(0),

  // Content
  description: z.string().optional().default(''),
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

  // Relationships
  productIds: z.array(z.string()).default([]),
});

export type TaxonomyFormValues = z.infer<typeof taxonomyFormSchema>;
