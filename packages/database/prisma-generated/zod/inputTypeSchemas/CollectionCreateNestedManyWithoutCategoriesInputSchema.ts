import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutCategoriesInputSchema } from './CollectionCreateWithoutCategoriesInputSchema';
import { CollectionUncheckedCreateWithoutCategoriesInputSchema } from './CollectionUncheckedCreateWithoutCategoriesInputSchema';
import { CollectionCreateOrConnectWithoutCategoriesInputSchema } from './CollectionCreateOrConnectWithoutCategoriesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutCategoriesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutCategoriesInputSchema),
          z.lazy(() => CollectionCreateWithoutCategoriesInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutCategoriesInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutCategoriesInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionCreateNestedManyWithoutCategoriesInputSchema;
