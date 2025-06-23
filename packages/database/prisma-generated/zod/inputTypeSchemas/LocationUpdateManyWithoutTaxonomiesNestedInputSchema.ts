import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutTaxonomiesInputSchema } from './LocationCreateWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateWithoutTaxonomiesInputSchema';
import { LocationCreateOrConnectWithoutTaxonomiesInputSchema } from './LocationCreateOrConnectWithoutTaxonomiesInputSchema';
import { LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema } from './LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema } from './LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema';
import { LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema } from './LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUpdateManyWithoutTaxonomiesNestedInputSchema: z.ZodType<Prisma.LocationUpdateManyWithoutTaxonomiesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema).array(),
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
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema),
          z.lazy(() => LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema).array(),
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

export default LocationUpdateManyWithoutTaxonomiesNestedInputSchema;
