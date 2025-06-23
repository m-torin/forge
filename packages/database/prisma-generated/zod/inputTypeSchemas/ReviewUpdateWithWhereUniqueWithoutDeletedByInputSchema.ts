import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutDeletedByInputSchema } from './ReviewUpdateWithoutDeletedByInputSchema';
import { ReviewUncheckedUpdateWithoutDeletedByInputSchema } from './ReviewUncheckedUpdateWithoutDeletedByInputSchema';

export const ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ReviewUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ReviewUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ReviewUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema;
