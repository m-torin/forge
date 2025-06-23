import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutDeletedByInputSchema } from './ReviewUpdateWithoutDeletedByInputSchema';
import { ReviewUncheckedUpdateWithoutDeletedByInputSchema } from './ReviewUncheckedUpdateWithoutDeletedByInputSchema';
import { ReviewCreateWithoutDeletedByInputSchema } from './ReviewCreateWithoutDeletedByInputSchema';
import { ReviewUncheckedCreateWithoutDeletedByInputSchema } from './ReviewUncheckedCreateWithoutDeletedByInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ReviewUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ReviewUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutDeletedByInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema;
