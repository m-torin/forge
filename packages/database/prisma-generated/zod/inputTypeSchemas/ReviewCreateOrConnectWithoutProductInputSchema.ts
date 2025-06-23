import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutProductInputSchema } from './ReviewCreateWithoutProductInputSchema';
import { ReviewUncheckedCreateWithoutProductInputSchema } from './ReviewUncheckedCreateWithoutProductInputSchema';

export const ReviewCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutProductInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default ReviewCreateOrConnectWithoutProductInputSchema;
