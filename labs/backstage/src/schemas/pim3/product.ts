import { z } from 'zod';
import { ContentStatus } from '@repo/database/prisma';

export const productFormSchema = z.object({
  // Basic information
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().default(''),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  status: z.nativeEnum(ContentStatus),

  // Details
  shortDescription: z.string().optional().default(''),
  longDescription: z.string().optional().default(''),

  // Pricing
  price: z.number().min(0, 'Price must be non-negative').optional(),
  compareAtPrice: z.number().min(0, 'Compare at price must be non-negative').optional(),
  costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),

  // Inventory
  quantity: z.number().int().min(0, 'Quantity must be non-negative').default(0),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),

  // Physical properties
  weight: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  depth: z.number().min(0).optional(),

  // SEO
  metaTitle: z.string().max(60).optional().default(''),
  metaDescription: z.string().max(160).optional().default(''),
  metaKeywords: z.string().optional().default(''),

  // Additional fields
  tags: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  brandId: z.string().optional().default(''),
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
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
