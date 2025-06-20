import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinCreateWithoutReviewInputSchema } from './ReviewVoteJoinCreateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema';

export const ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateOrConnectWithoutReviewInput> = z.object({
  where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema) ]),
}).strict();

export default ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema;
