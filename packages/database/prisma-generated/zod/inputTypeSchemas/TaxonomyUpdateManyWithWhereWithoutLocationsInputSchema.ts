import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutLocationsInputSchema } from './TaxonomyUncheckedUpdateManyWithoutLocationsInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutLocationsInput> = z.object({
  where: z.lazy(() => TaxonomyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TaxonomyUpdateManyMutationInputSchema),z.lazy(() => TaxonomyUncheckedUpdateManyWithoutLocationsInputSchema) ]),
}).strict();

export default TaxonomyUpdateManyWithWhereWithoutLocationsInputSchema;
