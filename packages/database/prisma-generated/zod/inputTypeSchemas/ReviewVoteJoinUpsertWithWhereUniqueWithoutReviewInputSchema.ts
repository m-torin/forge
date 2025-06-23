import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithoutReviewInputSchema } from './ReviewVoteJoinUpdateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema';
import { ReviewVoteJoinCreateWithoutReviewInputSchema } from './ReviewVoteJoinCreateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema';

export const ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInput> =
  z
    .object({
      where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ReviewVoteJoinUpdateWithoutReviewInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedUpdateWithoutReviewInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema),
      ]),
    })
    .strict();

export default ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema;
