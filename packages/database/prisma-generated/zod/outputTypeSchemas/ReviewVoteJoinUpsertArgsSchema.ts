import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinIncludeSchema } from '../inputTypeSchemas/ReviewVoteJoinIncludeSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinCreateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinCreateInputSchema';
import { ReviewVoteJoinUncheckedCreateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUncheckedCreateInputSchema';
import { ReviewVoteJoinUpdateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUpdateInputSchema';
import { ReviewVoteJoinUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUncheckedUpdateInputSchema';
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

export const ReviewVoteJoinUpsertArgsSchema: z.ZodType<Prisma.ReviewVoteJoinUpsertArgs> = z
  .object({
    select: ReviewVoteJoinSelectSchema.optional(),
    include: z.lazy(() => ReviewVoteJoinIncludeSchema).optional(),
    where: ReviewVoteJoinWhereUniqueInputSchema,
    create: z.union([ReviewVoteJoinCreateInputSchema, ReviewVoteJoinUncheckedCreateInputSchema]),
    update: z.union([ReviewVoteJoinUpdateInputSchema, ReviewVoteJoinUncheckedUpdateInputSchema]),
  })
  .strict();

export default ReviewVoteJoinUpsertArgsSchema;
