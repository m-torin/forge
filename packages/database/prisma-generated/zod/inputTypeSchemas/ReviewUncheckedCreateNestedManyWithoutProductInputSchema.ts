import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutProductInputSchema } from './ReviewCreateWithoutProductInputSchema';
import { ReviewUncheckedCreateWithoutProductInputSchema } from './ReviewUncheckedCreateWithoutProductInputSchema';
import { ReviewCreateOrConnectWithoutProductInputSchema } from './ReviewCreateOrConnectWithoutProductInputSchema';
import { ReviewCreateManyProductInputEnvelopeSchema } from './ReviewCreateManyProductInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutProductInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewCreateWithoutProductInputSchema),
          z.lazy(() => ReviewCreateWithoutProductInputSchema).array(),
          z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => ReviewUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => ReviewCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ReviewUncheckedCreateNestedManyWithoutProductInputSchema;
