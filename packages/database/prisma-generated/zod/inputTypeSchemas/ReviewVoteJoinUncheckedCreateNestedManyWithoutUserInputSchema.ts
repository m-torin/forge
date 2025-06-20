import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateWithoutUserInputSchema } from './ReviewVoteJoinCreateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutUserInputSchema';
import { ReviewVoteJoinCreateOrConnectWithoutUserInputSchema } from './ReviewVoteJoinCreateOrConnectWithoutUserInputSchema';
import { ReviewVoteJoinCreateManyUserInputEnvelopeSchema } from './ReviewVoteJoinCreateManyUserInputEnvelopeSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';

export const ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema),z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema).array(),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutUserInputSchema),z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ReviewVoteJoinCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInputSchema;
