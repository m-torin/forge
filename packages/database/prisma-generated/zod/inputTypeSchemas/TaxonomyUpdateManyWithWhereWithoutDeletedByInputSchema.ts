import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutDeletedByInputSchema } from './TaxonomyUncheckedUpdateManyWithoutDeletedByInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => TaxonomyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaxonomyUpdateManyMutationInputSchema),z.lazy(() => TaxonomyUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default TaxonomyUpdateManyWithWhereWithoutDeletedByInputSchema;
