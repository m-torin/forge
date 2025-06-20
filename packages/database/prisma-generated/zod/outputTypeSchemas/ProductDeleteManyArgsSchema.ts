import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductWhereInputSchema } from '../inputTypeSchemas/ProductWhereInputSchema'

export const ProductDeleteManyArgsSchema: z.ZodType<Prisma.ProductDeleteManyArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ProductDeleteManyArgsSchema;
