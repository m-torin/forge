import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithoutUserInputSchema } from './ReviewVoteJoinUpdateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema';
import { ReviewVoteJoinCreateWithoutUserInputSchema } from './ReviewVoteJoinCreateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutUserInputSchema';

export const ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ReviewVoteJoinUpdateWithoutUserInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema),
        z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema;
