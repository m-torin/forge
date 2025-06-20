import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutUserInputSchema } from './CollectionUncheckedUpdateManyWithoutUserInputSchema';

export const CollectionUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutUserInputSchema;
