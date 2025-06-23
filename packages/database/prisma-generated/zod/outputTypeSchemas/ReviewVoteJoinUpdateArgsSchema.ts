import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinIncludeSchema } from '../inputTypeSchemas/ReviewVoteJoinIncludeSchema';
import { ReviewVoteJoinUpdateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUpdateInputSchema';
import { ReviewVoteJoinUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUncheckedUpdateInputSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereUniqueInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ReviewArgsSchema } from '../outputTypeSchemas/ReviewArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewVoteJoinSelectSchema: z.ZodType<Prisma.ReviewVoteJoinSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    voteType: z.boolean().optional(),
    userId: z.boolean().optional(),
    reviewId: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    review: z.union([z.boolean(), z.lazy(() => ReviewArgsSchema)]).optional(),
  })
  .strict();

export const ReviewVoteJoinUpdateArgsSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateArgs> = z
  .object({
    select: ReviewVoteJoinSelectSchema.optional(),
    include: z.lazy(() => ReviewVoteJoinIncludeSchema).optional(),
    data: z.union([ReviewVoteJoinUpdateInputSchema, ReviewVoteJoinUncheckedUpdateInputSchema]),
    where: ReviewVoteJoinWhereUniqueInputSchema,
  })
  .strict();

export default ReviewVoteJoinUpdateArgsSchema;
