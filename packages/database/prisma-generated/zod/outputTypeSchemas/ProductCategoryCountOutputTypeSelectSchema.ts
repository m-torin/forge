import { z } from 'zod';
import type { Prisma } from '../../client';

export const ProductCategoryCountOutputTypeSelectSchema: z.ZodType<Prisma.ProductCategoryCountOutputTypeSelect> =
  z
    .object({
      children: z.boolean().optional(),
      products: z.boolean().optional(),
      collections: z.boolean().optional(),
      media: z.boolean().optional(),
    })
    .strict();

export default ProductCategoryCountOutputTypeSelectSchema;
