import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionUpdateWithoutIdentifiersInputSchema } from './CollectionUpdateWithoutIdentifiersInputSchema';
import { CollectionUncheckedUpdateWithoutIdentifiersInputSchema } from './CollectionUncheckedUpdateWithoutIdentifiersInputSchema';

export const CollectionUpdateToOneWithWhereWithoutIdentifiersInputSchema: z.ZodType<Prisma.CollectionUpdateToOneWithWhereWithoutIdentifiersInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutIdentifiersInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutIdentifiersInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateToOneWithWhereWithoutIdentifiersInputSchema;
