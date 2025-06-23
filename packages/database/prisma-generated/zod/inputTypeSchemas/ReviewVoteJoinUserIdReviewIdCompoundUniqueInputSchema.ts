import type { Prisma } from '../../client';

import { z } from 'zod';

export const ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema: z.ZodType<Prisma.ReviewVoteJoinUserIdReviewIdCompoundUniqueInput> =
  z
    .object({
      userId: z.string(),
      reviewId: z.string(),
    })
    .strict();

export default ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema;
