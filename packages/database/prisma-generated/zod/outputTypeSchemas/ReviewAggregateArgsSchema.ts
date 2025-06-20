import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewWhereInputSchema } from '../inputTypeSchemas/ReviewWhereInputSchema'
import { ReviewOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewOrderByWithRelationInputSchema'
import { ReviewWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewWhereUniqueInputSchema'

export const ReviewAggregateArgsSchema: z.ZodType<Prisma.ReviewAggregateArgs> = z.object({
  where: ReviewWhereInputSchema.optional(),
  orderBy: z.union([ ReviewOrderByWithRelationInputSchema.array(),ReviewOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReviewAggregateArgsSchema;
