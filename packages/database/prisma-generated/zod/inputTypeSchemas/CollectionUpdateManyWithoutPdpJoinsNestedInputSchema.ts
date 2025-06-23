import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutPdpJoinsInputSchema } from './CollectionCreateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedCreateWithoutPdpJoinsInputSchema } from './CollectionUncheckedCreateWithoutPdpJoinsInputSchema';
import { CollectionCreateOrConnectWithoutPdpJoinsInputSchema } from './CollectionCreateOrConnectWithoutPdpJoinsInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema } from './CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema } from './CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema';
import { CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema } from './CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUpdateManyWithoutPdpJoinsNestedInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithoutPdpJoinsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema),
          z.lazy(() => CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => CollectionScalarWhereInputSchema),
          z.lazy(() => CollectionScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionUpdateManyWithoutPdpJoinsNestedInputSchema;
