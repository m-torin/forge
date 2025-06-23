import { z } from 'zod';
import type { Prisma } from '../../client';

export const ProductCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCountOutputTypeSelect> = z
  .object({
    children: z.boolean().optional(),
    soldBy: z.boolean().optional(),
    collections: z.boolean().optional(),
    taxonomies: z.boolean().optional(),
    categories: z.boolean().optional(),
    media: z.boolean().optional(),
    favorites: z.boolean().optional(),
    registries: z.boolean().optional(),
    fandoms: z.boolean().optional(),
    series: z.boolean().optional(),
    stories: z.boolean().optional(),
    locations: z.boolean().optional(),
    casts: z.boolean().optional(),
    cartItems: z.boolean().optional(),
    cartItemVariants: z.boolean().optional(),
    orderItems: z.boolean().optional(),
    orderItemVariants: z.boolean().optional(),
    inventory: z.boolean().optional(),
    inventoryVariants: z.boolean().optional(),
    identifiers: z.boolean().optional(),
    reviews: z.boolean().optional(),
  })
  .strict();

export default ProductCountOutputTypeSelectSchema;
