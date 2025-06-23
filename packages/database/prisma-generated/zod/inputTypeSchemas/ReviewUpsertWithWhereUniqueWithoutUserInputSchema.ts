import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithoutUserInputSchema } from './ReviewUpdateWithoutUserInputSchema';
import { ReviewUncheckedUpdateWithoutUserInputSchema } from './ReviewUncheckedUpdateWithoutUserInputSchema';
import { ReviewCreateWithoutUserInputSchema } from './ReviewCreateWithoutUserInputSchema';
import { ReviewUncheckedCreateWithoutUserInputSchema } from './ReviewUncheckedCreateWithoutUserInputSchema';

export const ReviewUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.ReviewUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ReviewUpdateWithoutUserInputSchema),
        z.lazy(() => ReviewUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutUserInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ReviewUpsertWithWhereUniqueWithoutUserInputSchema;
