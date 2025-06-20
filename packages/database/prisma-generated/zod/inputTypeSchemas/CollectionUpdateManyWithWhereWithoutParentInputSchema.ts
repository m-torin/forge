import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutParentInputSchema } from './CollectionUncheckedUpdateManyWithoutParentInputSchema';

export const CollectionUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutParentInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutParentInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutParentInputSchema;
