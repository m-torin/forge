import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryCreateManyInputSchema } from '../inputTypeSchemas/ProductCategoryCreateManyInputSchema'

export const ProductCategoryCreateManyArgsSchema: z.ZodType<Prisma.ProductCategoryCreateManyArgs> = z.object({
  data: z.union([ ProductCategoryCreateManyInputSchema,ProductCategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ProductCategoryCreateManyArgsSchema;
