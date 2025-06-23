import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionUpdateWithoutMediaInputSchema } from './CollectionUpdateWithoutMediaInputSchema';
import { CollectionUncheckedUpdateWithoutMediaInputSchema } from './CollectionUncheckedUpdateWithoutMediaInputSchema';

export const CollectionUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.CollectionUpdateToOneWithWhereWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutMediaInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateToOneWithWhereWithoutMediaInputSchema;
