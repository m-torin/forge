import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutBrandsInputSchema } from './CollectionUncheckedUpdateManyWithoutBrandsInputSchema';

export const CollectionUpdateManyWithWhereWithoutBrandsInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutBrandsInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutBrandsInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutBrandsInputSchema;
