import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutProductInputSchema } from './ReviewCreateWithoutProductInputSchema';
import { ReviewUncheckedCreateWithoutProductInputSchema } from './ReviewUncheckedCreateWithoutProductInputSchema';
import { ReviewCreateOrConnectWithoutProductInputSchema } from './ReviewCreateOrConnectWithoutProductInputSchema';
import { ReviewUpsertWithWhereUniqueWithoutProductInputSchema } from './ReviewUpsertWithWhereUniqueWithoutProductInputSchema';
import { ReviewCreateManyProductInputEnvelopeSchema } from './ReviewCreateManyProductInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';
import { ReviewUpdateWithWhereUniqueWithoutProductInputSchema } from './ReviewUpdateWithWhereUniqueWithoutProductInputSchema';
import { ReviewUpdateManyWithWhereWithoutProductInputSchema } from './ReviewUpdateManyWithWhereWithoutProductInputSchema';
import { ReviewScalarWhereInputSchema } from './ReviewScalarWhereInputSchema';

export const ReviewUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateManyWithoutProductNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => ReviewUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewCreateManyProductInputEnvelopeSchema).optional(),
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
          z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => ReviewUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => ReviewUpdateManyWithWhereWithoutProductInputSchema).array(),
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

export default ReviewUncheckedUpdateManyWithoutProductNestedInputSchema;
