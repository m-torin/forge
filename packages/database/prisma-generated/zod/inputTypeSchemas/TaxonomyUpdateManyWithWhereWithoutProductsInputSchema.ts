import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutProductsInputSchema } from './TaxonomyUncheckedUpdateManyWithoutProductsInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => TaxonomyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaxonomyUpdateManyMutationInputSchema),z.lazy(() => TaxonomyUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default TaxonomyUpdateManyWithWhereWithoutProductsInputSchema;
