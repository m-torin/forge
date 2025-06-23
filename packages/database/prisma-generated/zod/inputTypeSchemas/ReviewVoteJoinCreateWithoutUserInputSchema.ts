import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';
import { ReviewCreateNestedOneWithoutVotesInputSchema } from './ReviewCreateNestedOneWithoutVotesInputSchema';

export const ReviewVoteJoinCreateWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateWithoutUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      voteType: z.lazy(() => VoteTypeSchema),
      review: z.lazy(() => ReviewCreateNestedOneWithoutVotesInputSchema),
    })
    .strict();

export default ReviewVoteJoinCreateWithoutUserInputSchema;
