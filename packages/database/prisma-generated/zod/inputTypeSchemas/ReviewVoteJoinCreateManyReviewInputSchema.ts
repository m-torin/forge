import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';

export const ReviewVoteJoinCreateManyReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateManyReviewInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  voteType: z.lazy(() => VoteTypeSchema),
  userId: z.string()
}).strict();

export default ReviewVoteJoinCreateManyReviewInputSchema;
