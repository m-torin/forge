import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';
import { ReviewUpdateManyMutationInputSchema } from './ReviewUpdateManyMutationInputSchema';
import { ReviewUncheckedUpdateManyWithoutDeletedByInputSchema } from './ReviewUncheckedUpdateManyWithoutDeletedByInputSchema';

export const ReviewUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ReviewScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ReviewUpdateManyMutationInputSchema),z.lazy(() => ReviewUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default ReviewUpdateManyWithWhereWithoutDeletedByInputSchema;
