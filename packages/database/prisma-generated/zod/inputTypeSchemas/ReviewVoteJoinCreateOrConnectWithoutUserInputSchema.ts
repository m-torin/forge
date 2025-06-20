import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinCreateWithoutUserInputSchema } from './ReviewVoteJoinCreateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutUserInputSchema';

export const ReviewVoteJoinCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema),z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default ReviewVoteJoinCreateOrConnectWithoutUserInputSchema;
