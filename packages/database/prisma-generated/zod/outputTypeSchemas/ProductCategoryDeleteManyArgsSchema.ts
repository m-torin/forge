import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryWhereInputSchema } from '../inputTypeSchemas/ProductCategoryWhereInputSchema'

export const ProductCategoryDeleteManyArgsSchema: z.ZodType<Prisma.ProductCategoryDeleteManyArgs> = z.object({
  where: ProductCategoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ProductCategoryDeleteManyArgsSchema;
