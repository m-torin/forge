import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutProductInputSchema } from './ReviewUpdateWithoutProductInputSchema';
import { ReviewUncheckedUpdateWithoutProductInputSchema } from './ReviewUncheckedUpdateWithoutProductInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateWithoutProductInputSchema),z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default ReviewUpdateWithWhereUniqueWithoutProductInputSchema;
