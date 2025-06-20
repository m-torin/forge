import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductWhereInputSchema } from '../inputTypeSchemas/ProductWhereInputSchema'
import { ProductOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ProductOrderByWithAggregationInputSchema'
import { ProductScalarFieldEnumSchema } from '../inputTypeSchemas/ProductScalarFieldEnumSchema'
import { ProductScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ProductScalarWhereWithAggregatesInputSchema'

export const ProductGroupByArgsSchema: z.ZodType<Prisma.ProductGroupByArgs> = z.object({
  where: ProductWhereInputSchema.optional(),
  orderBy: z.union([ ProductOrderByWithAggregationInputSchema.array(),ProductOrderByWithAggregationInputSchema ]).optional(),
  by: ProductScalarFieldEnumSchema.array(),
  having: ProductScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ProductGroupByArgsSchema;
