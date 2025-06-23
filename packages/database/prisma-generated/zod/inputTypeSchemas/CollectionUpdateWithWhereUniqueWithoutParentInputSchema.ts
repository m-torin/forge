import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutParentInputSchema } from './CollectionUpdateWithoutParentInputSchema';
import { CollectionUncheckedUpdateWithoutParentInputSchema } from './CollectionUncheckedUpdateWithoutParentInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutParentInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutParentInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateWithWhereUniqueWithoutParentInputSchema;
