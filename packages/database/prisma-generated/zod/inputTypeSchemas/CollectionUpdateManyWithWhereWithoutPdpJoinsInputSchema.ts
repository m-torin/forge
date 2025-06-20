import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutPdpJoinsInputSchema } from './CollectionUncheckedUpdateManyWithoutPdpJoinsInputSchema';

export const CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutPdpJoinsInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutPdpJoinsInputSchema;
