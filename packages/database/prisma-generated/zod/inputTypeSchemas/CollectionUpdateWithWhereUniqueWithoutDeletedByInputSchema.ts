import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutDeletedByInputSchema } from './CollectionUpdateWithoutDeletedByInputSchema';
import { CollectionUncheckedUpdateWithoutDeletedByInputSchema } from './CollectionUncheckedUpdateWithoutDeletedByInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutDeletedByInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateWithWhereUniqueWithoutDeletedByInputSchema;
