import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutParentInputSchema } from './CollectionUpdateWithoutParentInputSchema';
import { CollectionUncheckedUpdateWithoutParentInputSchema } from './CollectionUncheckedUpdateWithoutParentInputSchema';
import { CollectionCreateWithoutParentInputSchema } from './CollectionCreateWithoutParentInputSchema';
import { CollectionUncheckedCreateWithoutParentInputSchema } from './CollectionUncheckedCreateWithoutParentInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CollectionUpdateWithoutParentInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionCreateWithoutParentInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default CollectionUpsertWithWhereUniqueWithoutParentInputSchema;
