import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutDeletedByInputSchema } from './CollectionUpdateWithoutDeletedByInputSchema';
import { CollectionUncheckedUpdateWithoutDeletedByInputSchema } from './CollectionUncheckedUpdateWithoutDeletedByInputSchema';
import { CollectionCreateWithoutDeletedByInputSchema } from './CollectionCreateWithoutDeletedByInputSchema';
import { CollectionUncheckedCreateWithoutDeletedByInputSchema } from './CollectionUncheckedCreateWithoutDeletedByInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutDeletedByInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutDeletedByInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default CollectionUpsertWithWhereUniqueWithoutDeletedByInputSchema;
