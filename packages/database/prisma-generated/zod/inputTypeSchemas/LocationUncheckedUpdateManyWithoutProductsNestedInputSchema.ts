import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutProductsInputSchema } from './LocationCreateWithoutProductsInputSchema';
import { LocationUncheckedCreateWithoutProductsInputSchema } from './LocationUncheckedCreateWithoutProductsInputSchema';
import { LocationCreateOrConnectWithoutProductsInputSchema } from './LocationCreateOrConnectWithoutProductsInputSchema';
import { LocationUpsertWithWhereUniqueWithoutProductsInputSchema } from './LocationUpsertWithWhereUniqueWithoutProductsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutProductsInputSchema } from './LocationUpdateWithWhereUniqueWithoutProductsInputSchema';
import { LocationUpdateManyWithWhereWithoutProductsInputSchema } from './LocationUpdateManyWithWhereWithoutProductsInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUncheckedUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyWithoutProductsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutProductsInputSchema),
          z.lazy(() => LocationCreateWithoutProductsInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutProductsInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutProductsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => LocationUpsertWithWhereUniqueWithoutProductsInputSchema).array(),
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
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => LocationUpdateWithWhereUniqueWithoutProductsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => LocationUpdateManyWithWhereWithoutProductsInputSchema),
          z.lazy(() => LocationUpdateManyWithWhereWithoutProductsInputSchema).array(),
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

export default LocationUncheckedUpdateManyWithoutProductsNestedInputSchema;
