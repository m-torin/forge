import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateManyReviewInputSchema } from './ReviewVoteJoinCreateManyReviewInputSchema';

export const ReviewVoteJoinCreateManyReviewInputEnvelopeSchema: z.ZodType<Prisma.ReviewVoteJoinCreateManyReviewInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewVoteJoinCreateManyReviewInputSchema),z.lazy(() => ReviewVoteJoinCreateManyReviewInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewVoteJoinCreateManyReviewInputEnvelopeSchema;
