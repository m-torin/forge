import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutDeletedByInputSchema } from './ReviewCreateWithoutDeletedByInputSchema';
import { ReviewUncheckedCreateWithoutDeletedByInputSchema } from './ReviewUncheckedCreateWithoutDeletedByInputSchema';
import { ReviewCreateOrConnectWithoutDeletedByInputSchema } from './ReviewCreateOrConnectWithoutDeletedByInputSchema';
import { ReviewCreateManyDeletedByInputEnvelopeSchema } from './ReviewCreateManyDeletedByInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.ReviewCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewCreateWithoutDeletedByInputSchema),
          z.lazy(() => ReviewCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => ReviewUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => ReviewUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ReviewCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => ReviewCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ReviewCreateNestedManyWithoutDeletedByInputSchema;
