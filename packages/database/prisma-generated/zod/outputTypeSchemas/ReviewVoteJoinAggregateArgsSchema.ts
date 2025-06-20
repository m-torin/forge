import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinWhereInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereInputSchema'
import { ReviewVoteJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewVoteJoinOrderByWithRelationInputSchema'
import { ReviewVoteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereUniqueInputSchema'

export const ReviewVoteJoinAggregateArgsSchema: z.ZodType<Prisma.ReviewVoteJoinAggregateArgs> = z.object({
  where: ReviewVoteJoinWhereInputSchema.optional(),
  orderBy: z.union([ ReviewVoteJoinOrderByWithRelationInputSchema.array(),ReviewVoteJoinOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewVoteJoinWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReviewVoteJoinAggregateArgsSchema;
