import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionScalarWhereInputSchema } from './CollectionScalarWhereInputSchema';
import { CollectionUpdateManyMutationInputSchema } from './CollectionUpdateManyMutationInputSchema';
import { CollectionUncheckedUpdateManyWithoutTaxonomiesInputSchema } from './CollectionUncheckedUpdateManyWithoutTaxonomiesInputSchema';

export const CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema: z.ZodType<Prisma.CollectionUpdateManyWithWhereWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => CollectionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CollectionUpdateManyMutationInputSchema),z.lazy(() => CollectionUncheckedUpdateManyWithoutTaxonomiesInputSchema) ]),
}).strict();

export default CollectionUpdateManyWithWhereWithoutTaxonomiesInputSchema;
