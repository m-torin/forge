import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionUpdateWithoutChildrenInputSchema } from './CollectionUpdateWithoutChildrenInputSchema';
import { CollectionUncheckedUpdateWithoutChildrenInputSchema } from './CollectionUncheckedUpdateWithoutChildrenInputSchema';
import { CollectionCreateWithoutChildrenInputSchema } from './CollectionCreateWithoutChildrenInputSchema';
import { CollectionUncheckedCreateWithoutChildrenInputSchema } from './CollectionUncheckedCreateWithoutChildrenInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.CollectionUpsertWithoutChildrenInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutChildrenInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutChildrenInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutChildrenInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutChildrenInputSchema),
      ]),
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
    })
    .strict();

export default CollectionUpsertWithoutChildrenInputSchema;
