import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithoutReviewInputSchema } from './ReviewVoteJoinUpdateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema';

export const ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInput> =
  z
    .object({
      where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ReviewVoteJoinUpdateWithoutReviewInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema),
      ]),
    })
    .strict();

export default ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema;
