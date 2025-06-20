import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutDeletedByInputSchema } from './CollectionUncheckedUpdateManyWithoutDeletedByInputSchema';

export const CollectionUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutDeletedByInputSchema;
