import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinWhereInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereInputSchema';
import { ReviewVoteJoinOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReviewVoteJoinOrderByWithAggregationInputSchema';
import { ReviewVoteJoinScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewVoteJoinScalarFieldEnumSchema';
import { ReviewVoteJoinScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReviewVoteJoinScalarWhereWithAggregatesInputSchema';

export const ReviewVoteJoinGroupByArgsSchema: z.ZodType<Prisma.ReviewVoteJoinGroupByArgs> = z
  .object({
    where: ReviewVoteJoinWhereInputSchema.optional(),
    orderBy: z
      .union([
        ReviewVoteJoinOrderByWithAggregationInputSchema.array(),
        ReviewVoteJoinOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: ReviewVoteJoinScalarFieldEnumSchema.array(),
    having: ReviewVoteJoinScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default ReviewVoteJoinGroupByArgsSchema;
