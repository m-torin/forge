import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutCategoriesInputSchema } from './CollectionUncheckedUpdateManyWithoutCategoriesInputSchema';

export const CollectionUpdateManyWithWhereWithoutCategoriesInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutCategoriesInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutCategoriesInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutCategoriesInputSchema;
