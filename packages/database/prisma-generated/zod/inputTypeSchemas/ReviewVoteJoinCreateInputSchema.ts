import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';
import { UserCreateNestedOneWithoutReviewVotesInputSchema } from './UserCreateNestedOneWithoutReviewVotesInputSchema';
import { ReviewCreateNestedOneWithoutVotesInputSchema } from './ReviewCreateNestedOneWithoutVotesInputSchema';

export const ReviewVoteJoinCreateInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  voteType: z.lazy(() => VoteTypeSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewVotesInputSchema),
  review: z.lazy(() => ReviewCreateNestedOneWithoutVotesInputSchema)
}).strict();

export default ReviewVoteJoinCreateInputSchema;
