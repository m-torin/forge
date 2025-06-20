import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutProductsInputSchema } from './CollectionUpdateWithoutProductsInputSchema';
import { CollectionUncheckedUpdateWithoutProductsInputSchema } from './CollectionUncheckedUpdateWithoutProductsInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => CollectionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutProductsInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export default CollectionUpdateWithWhereUniqueWithoutProductsInputSchema;
