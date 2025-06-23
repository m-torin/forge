import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutProductInputSchema } from './ReviewUpdateWithoutProductInputSchema';
import { ReviewUncheckedUpdateWithoutProductInputSchema } from './ReviewUncheckedUpdateWithoutProductInputSchema';
import { ReviewCreateWithoutProductInputSchema } from './ReviewCreateWithoutProductInputSchema';
import { ReviewUncheckedCreateWithoutProductInputSchema } from './ReviewUncheckedCreateWithoutProductInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ReviewUpdateWithoutProductInputSchema),
        z.lazy(() => ReviewUncheckedUpdateWithoutProductInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutProductInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default ReviewUpsertWithWhereUniqueWithoutProductInputSchema;
