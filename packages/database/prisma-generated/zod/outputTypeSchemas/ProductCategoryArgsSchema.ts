import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategorySelectSchema } from '../inputTypeSchemas/ProductCategorySelectSchema';
import { ProductCategoryIncludeSchema } from '../inputTypeSchemas/ProductCategoryIncludeSchema';

export const ProductCategoryArgsSchema: z.ZodType<Prisma.ProductCategoryDefaultArgs> = z.object({
  select: z.lazy(() => ProductCategorySelectSchema).optional(),
  include: z.lazy(() => ProductCategoryIncludeSchema).optional(),
}).strict();

export default ProductCategoryArgsSchema;
