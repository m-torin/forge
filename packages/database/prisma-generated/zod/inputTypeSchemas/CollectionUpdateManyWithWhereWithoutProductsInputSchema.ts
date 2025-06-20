import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutProductsInputSchema } from './CollectionUncheckedUpdateManyWithoutProductsInputSchema';

export const CollectionUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutProductsInputSchema;
