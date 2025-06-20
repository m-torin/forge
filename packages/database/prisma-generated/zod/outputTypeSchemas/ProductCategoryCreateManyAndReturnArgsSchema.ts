import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryCreateManyInputSchema } from '../inputTypeSchemas/ProductCategoryCreateManyInputSchema'

export const ProductCategoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductCategoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductCategoryCreateManyInputSchema,ProductCategoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ProductCategoryCreateManyAndReturnArgsSchema;
