import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinScalarWhereInputSchema } from './ReviewVoteJoinScalarWhereInputSchema';
import { ReviewVoteJoinUpdateManyMutationInputSchema } from './ReviewVoteJoinUpdateManyMutationInputSchema';
import { ReviewVoteJoinUncheckedUpdateManyWithoutUserInputSchema } from './ReviewVoteJoinUncheckedUpdateManyWithoutUserInputSchema';

export const ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewVoteJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewVoteJoinUpdateManyMutationInputSchema),z.lazy(() => ReviewVoteJoinUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema;
