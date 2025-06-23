import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';

export const ReviewVoteJoinUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinUncheckedCreateWithoutUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      voteType: z.lazy(() => VoteTypeSchema),
      reviewId: z.string(),
    })
    .strict();

export default ReviewVoteJoinUncheckedCreateWithoutUserInputSchema;
