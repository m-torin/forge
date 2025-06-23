import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutMediaInputSchema } from './ReviewCreateWithoutMediaInputSchema';
import { ReviewUncheckedCreateWithoutMediaInputSchema } from './ReviewUncheckedCreateWithoutMediaInputSchema';

export const ReviewCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutMediaInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default ReviewCreateOrConnectWithoutMediaInputSchema;
