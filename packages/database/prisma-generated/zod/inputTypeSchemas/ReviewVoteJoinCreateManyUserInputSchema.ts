import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';

export const ReviewVoteJoinCreateManyUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  voteType: z.lazy(() => VoteTypeSchema),
  reviewId: z.string()
}).strict();

export default ReviewVoteJoinCreateManyUserInputSchema;
