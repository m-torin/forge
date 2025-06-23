import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionUpdateWithoutIdentifiersInputSchema } from './CollectionUpdateWithoutIdentifiersInputSchema';
import { CollectionUncheckedUpdateWithoutIdentifiersInputSchema } from './CollectionUncheckedUpdateWithoutIdentifiersInputSchema';
import { CollectionCreateWithoutIdentifiersInputSchema } from './CollectionCreateWithoutIdentifiersInputSchema';
import { CollectionUncheckedCreateWithoutIdentifiersInputSchema } from './CollectionUncheckedCreateWithoutIdentifiersInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionUpsertWithoutIdentifiersInputSchema: z.ZodType<Prisma.CollectionUpsertWithoutIdentifiersInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutIdentifiersInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutIdentifiersInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutIdentifiersInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutIdentifiersInputSchema),
      ]),
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
    })
    .strict();

export default CollectionUpsertWithoutIdentifiersInputSchema;
