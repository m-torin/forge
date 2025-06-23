import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinScalarWhereInputSchema } from './ReviewVoteJoinScalarWhereInputSchema';
import { ReviewVoteJoinUpdateManyMutationInputSchema } from './ReviewVoteJoinUpdateManyMutationInputSchema';
import { ReviewVoteJoinUncheckedUpdateManyWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedUpdateManyWithoutReviewInputSchema';

export const ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateManyWithWhereWithoutReviewInput> =
  z
    .object({
      where: z.lazy(() => ReviewVoteJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ReviewVoteJoinUpdateManyMutationInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedUpdateManyWithoutReviewInputSchema),
      ]),
    })
    .strict();

export default ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema;
