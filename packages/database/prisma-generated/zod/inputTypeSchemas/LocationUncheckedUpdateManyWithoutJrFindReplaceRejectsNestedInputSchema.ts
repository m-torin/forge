import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
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
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array(),
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

export default LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
