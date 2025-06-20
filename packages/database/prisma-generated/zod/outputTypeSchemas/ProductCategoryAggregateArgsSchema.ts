import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCategoryWhereInputSchema } from '../inputTypeSchemas/ProductCategoryWhereInputSchema'
import { ProductCategoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/ProductCategoryOrderByWithRelationInputSchema'
import { ProductCategoryWhereUniqueInputSchema } from '../inputTypeSchemas/ProductCategoryWhereUniqueInputSchema'

export const ProductCategoryAggregateArgsSchema: z.ZodType<Prisma.ProductCategoryAggregateArgs> = z.object({
  where: ProductCategoryWhereInputSchema.optional(),
  orderBy: z.union([ ProductCategoryOrderByWithRelationInputSchema.array(),ProductCategoryOrderByWithRelationInputSchema ]).optional(),
  cursor: ProductCategoryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ProductCategoryAggregateArgsSchema;
