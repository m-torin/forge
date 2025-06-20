import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionUpdateWithoutChildrenInputSchema } from './CollectionUpdateWithoutChildrenInputSchema';
import { CollectionUncheckedUpdateWithoutChildrenInputSchema } from './CollectionUncheckedUpdateWithoutChildrenInputSchema';

export const CollectionUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.CollectionUpdateToOneWithWhereWithoutChildrenInput> = z.object({
  where: z.lazy(() => CollectionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CollectionUpdateWithoutChildrenInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutChildrenInputSchema) ]),
}).strict();

export default CollectionUpdateToOneWithWhereWithoutChildrenInputSchema;
