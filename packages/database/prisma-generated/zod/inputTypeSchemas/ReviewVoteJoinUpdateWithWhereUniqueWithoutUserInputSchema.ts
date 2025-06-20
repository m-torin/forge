import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithoutUserInputSchema } from './ReviewVoteJoinUpdateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema';

export const ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewVoteJoinUpdateWithoutUserInputSchema),z.lazy(() => ReviewVoteJoinUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema;
