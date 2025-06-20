import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewWhereInputSchema } from '../inputTypeSchemas/ReviewWhereInputSchema'
import { ReviewOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReviewOrderByWithAggregationInputSchema'
import { ReviewScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewScalarFieldEnumSchema'
import { ReviewScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReviewScalarWhereWithAggregatesInputSchema'

export const ReviewGroupByArgsSchema: z.ZodType<Prisma.ReviewGroupByArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithAggregationInputSchema.array(),ReviewOrderByWithAggregationInputSchema ]).optional(),
  by: ReviewScalarFieldEnumSchema.array(),
  having: ReviewScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReviewGroupByArgsSchema;
