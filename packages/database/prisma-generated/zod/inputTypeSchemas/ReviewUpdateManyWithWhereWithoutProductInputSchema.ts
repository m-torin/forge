import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutProductInputSchema } from './ReviewUncheckedUpdateManyWithoutProductInputSchema';

export const ReviewUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export default ReviewUpdateManyWithWhereWithoutProductInputSchema;
