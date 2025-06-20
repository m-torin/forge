import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutProductsInputSchema } from './CollectionUpdateWithoutProductsInputSchema';
import { CollectionUncheckedUpdateWithoutProductsInputSchema } from './CollectionUncheckedUpdateWithoutProductsInputSchema';
import { CollectionCreateWithoutProductsInputSchema } from './CollectionCreateWithoutProductsInputSchema';
import { CollectionUncheckedCreateWithoutProductsInputSchema } from './CollectionUncheckedCreateWithoutProductsInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CollectionUpdateWithoutProductsInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionCreateWithoutProductsInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default CollectionUpsertWithWhereUniqueWithoutProductsInputSchema;
