import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutBrandsInputSchema } from './CollectionCreateWithoutBrandsInputSchema';
import { CollectionUncheckedCreateWithoutBrandsInputSchema } from './CollectionUncheckedCreateWithoutBrandsInputSchema';
import { CollectionCreateOrConnectWithoutBrandsInputSchema } from './CollectionCreateOrConnectWithoutBrandsInputSchema';
import { CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema } from './CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema } from './CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema';
import { CollectionUpdateManyWithWhereWithoutBrandsInputSchema } from './CollectionUpdateManyWithWhereWithoutBrandsInputSchema';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';

export const CollectionUpdateManyWithoutBrandsNestedInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithoutBrandsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutBrandsInputSchema),
          z.lazy(() => CollectionCreateWithoutBrandsInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutBrandsInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutBrandsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema),
          z.lazy(() => CollectionUpsertWithWhereUniqueWithoutBrandsInputSchema).array(),
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
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema),
          z.lazy(() => CollectionUpdateWithWhereUniqueWithoutBrandsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CollectionUpdateManyWithWhereWithoutBrandsInputSchema),
          z.lazy(() => CollectionUpdateManyWithWhereWithoutBrandsInputSchema).array(),
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

export default CollectionUpdateManyWithoutBrandsNestedInputSchema;
