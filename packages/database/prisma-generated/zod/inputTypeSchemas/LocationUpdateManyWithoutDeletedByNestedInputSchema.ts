import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutDeletedByInputSchema } from './LocationCreateWithoutDeletedByInputSchema';
import { LocationUncheckedCreateWithoutDeletedByInputSchema } from './LocationUncheckedCreateWithoutDeletedByInputSchema';
import { LocationCreateOrConnectWithoutDeletedByInputSchema } from './LocationCreateOrConnectWithoutDeletedByInputSchema';
import { LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { LocationCreateManyDeletedByInputEnvelopeSchema } from './LocationCreateManyDeletedByInputEnvelopeSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { LocationUpdateManyWithWhereWithoutDeletedByInputSchema } from './LocationUpdateManyWithWhereWithoutDeletedByInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.LocationUpdateManyWithoutDeletedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutDeletedByInputSchema),
          z.lazy(() => LocationCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => LocationCreateManyDeletedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => LocationWhereUniqueInputSchema),
          z.lazy(() => LocationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => LocationWhereUniqueInputSchema),
          z.lazy(() => LocationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => LocationWhereUniqueInputSchema),
          z.lazy(() => LocationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => LocationWhereUniqueInputSchema),
          z.lazy(() => LocationWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => LocationUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => LocationUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => LocationScalarWhereInputSchema),
          z.lazy(() => LocationScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default LocationUpdateManyWithoutDeletedByNestedInputSchema;
