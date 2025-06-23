import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewCreateWithoutUserInputSchema } from './ReviewCreateWithoutUserInputSchema';
import { ReviewUncheckedCreateWithoutUserInputSchema } from './ReviewUncheckedCreateWithoutUserInputSchema';

export const ReviewCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.ReviewCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => ReviewWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => ReviewCreateWithoutUserInputSchema),
        z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default ReviewCreateOrConnectWithoutUserInputSchema;
