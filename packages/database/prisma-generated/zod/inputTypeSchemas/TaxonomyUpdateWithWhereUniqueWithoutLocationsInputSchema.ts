import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutLocationsInputSchema } from './TaxonomyUpdateWithoutLocationsInputSchema';
import { TaxonomyUncheckedUpdateWithoutLocationsInputSchema } from './TaxonomyUncheckedUpdateWithoutLocationsInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TaxonomyUpdateWithoutLocationsInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutLocationsInputSchema) ]),
}).strict();

export default TaxonomyUpdateWithWhereUniqueWithoutLocationsInputSchema;
