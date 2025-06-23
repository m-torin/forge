import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutDeletedByInputSchema } from './ReviewCreateWithoutDeletedByInputSchema';
import { ReviewUncheckedCreateWithoutDeletedByInputSchema } from './ReviewUncheckedCreateWithoutDeletedByInputSchema';
import { ReviewCreateOrConnectWithoutDeletedByInputSchema } from './ReviewCreateOrConnectWithoutDeletedByInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { ReviewCreateManyDeletedByInputEnvelopeSchema } from './ReviewCreateManyDeletedByInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { ReviewUpdateManyWithWhereWithoutDeletedByInputSchema } from './ReviewUpdateManyWithWhereWithoutDeletedByInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.ReviewUpdateManyWithoutDeletedByNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ReviewUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewCreateManyDeletedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ReviewUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ReviewUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => ReviewUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ReviewScalarWhereInputSchema),
          z.lazy(() => ReviewScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ReviewUpdateManyWithoutDeletedByNestedInputSchema;
