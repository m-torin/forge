import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutCategoriesInputSchema } from './CollectionCreateWithoutCategoriesInputSchema';
import { CollectionUncheckedCreateWithoutCategoriesInputSchema } from './CollectionUncheckedCreateWithoutCategoriesInputSchema';

export const CollectionCreateOrConnectWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutCategoriesInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutCategoriesInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutCategoriesInputSchema),
      ]),
    })
    .strict();

export default CollectionCreateOrConnectWithoutCategoriesInputSchema;
