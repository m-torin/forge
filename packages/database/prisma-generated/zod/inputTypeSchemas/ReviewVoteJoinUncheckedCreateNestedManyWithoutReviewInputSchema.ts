import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateWithoutReviewInputSchema } from './ReviewVoteJoinCreateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema';
import { ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema } from './ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema';
import { ReviewVoteJoinCreateManyReviewInputEnvelopeSchema } from './ReviewVoteJoinCreateManyReviewInputEnvelopeSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';

export const ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInput> = z.object({
  create: z.union([ z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema),z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema).array(),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema),z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewVoteJoinCreateManyReviewInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInputSchema;
