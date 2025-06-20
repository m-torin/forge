import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductWhereInputSchema } from '../inputTypeSchemas/ProductWhereInputSchema'
import { ProductOrderByWithRelationInputSchema } from '../inputTypeSchemas/ProductOrderByWithRelationInputSchema'
import { ProductWhereUniqueInputSchema } from '../inputTypeSchemas/ProductWhereUniqueInputSchema'

export const ProductAggregateArgsSchema: z.ZodType<Prisma.ProductAggregateArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithRelationInputSchema.array(),ProductOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ProductAggregateArgsSchema;
