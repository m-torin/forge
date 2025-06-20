import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';
import { UserCreateNestedOneWithoutReviewVotesInputSchema } from './UserCreateNestedOneWithoutReviewVotesInputSchema';

export const ReviewVoteJoinCreateWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateWithoutReviewInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  voteType: z.lazy(() => VoteTypeSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewVotesInputSchema)
}).strict();

export default ReviewVoteJoinCreateWithoutReviewInputSchema;
