import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutDeletedByInputSchema } from './ReviewCreateWithoutDeletedByInputSchema';
import { ReviewUncheckedCreateWithoutDeletedByInputSchema } from './ReviewUncheckedCreateWithoutDeletedByInputSchema';

export const ReviewCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ReviewWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ReviewCreateWithoutDeletedByInputSchema),z.lazy(() => ReviewUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default ReviewCreateOrConnectWithoutDeletedByInputSchema;
