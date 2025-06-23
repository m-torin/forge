import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutPdpJoinsInputSchema } from './LocationCreateWithoutPdpJoinsInputSchema';
import { LocationUncheckedCreateWithoutPdpJoinsInputSchema } from './LocationUncheckedCreateWithoutPdpJoinsInputSchema';
import { LocationCreateOrConnectWithoutPdpJoinsInputSchema } from './LocationCreateOrConnectWithoutPdpJoinsInputSchema';
import { LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema } from './LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema } from './LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema';
import { LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema } from './LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUpdateManyWithoutPdpJoinsNestedInputSchema: z.ZodType<Prisma.LocationUpdateManyWithoutPdpJoinsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema).array(),
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
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema),
          z.lazy(() => LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema).array(),
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

export default LocationUpdateManyWithoutPdpJoinsNestedInputSchema;
