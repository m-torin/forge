import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionUpdateWithoutMediaInputSchema } from './CollectionUpdateWithoutMediaInputSchema';
import { CollectionUncheckedUpdateWithoutMediaInputSchema } from './CollectionUncheckedUpdateWithoutMediaInputSchema';
import { CollectionCreateWithoutMediaInputSchema } from './CollectionCreateWithoutMediaInputSchema';
import { CollectionUncheckedCreateWithoutMediaInputSchema } from './CollectionUncheckedCreateWithoutMediaInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionUpsertWithoutMediaInputSchema: z.ZodType<Prisma.CollectionUpsertWithoutMediaInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutMediaInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutMediaInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutMediaInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutMediaInputSchema),
      ]),
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
    })
    .strict();

export default CollectionUpsertWithoutMediaInputSchema;
