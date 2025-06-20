import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersWhereInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereInputSchema'
import { ProductIdentifiersOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ProductIdentifiersOrderByWithAggregationInputSchema'
import { ProductIdentifiersScalarFieldEnumSchema } from '../inputTypeSchemas/ProductIdentifiersScalarFieldEnumSchema'
import { ProductIdentifiersScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ProductIdentifiersScalarWhereWithAggregatesInputSchema'

export const ProductIdentifiersGroupByArgsSchema: z.ZodType<Prisma.ProductIdentifiersGroupByArgs> = z.object({
  where: ProductIdentifiersWhereInputSchema.optional(),
  orderBy: z.union([ ProductIdentifiersOrderByWithAggregationInputSchema.array(),ProductIdentifiersOrderByWithAggregationInputSchema ]).optional(),
  by: ProductIdentifiersScalarFieldEnumSchema.array(),
  having: ProductIdentifiersScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ProductIdentifiersGroupByArgsSchema;
