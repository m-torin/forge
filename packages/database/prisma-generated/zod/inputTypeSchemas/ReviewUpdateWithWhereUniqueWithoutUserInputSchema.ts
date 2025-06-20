import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutUserInputSchema } from './ReviewUpdateWithoutUserInputSchema';
import { ReviewUncheckedUpdateWithoutUserInputSchema } from './ReviewUncheckedUpdateWithoutUserInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutUserInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default ReviewUpdateWithWhereUniqueWithoutUserInputSchema;
