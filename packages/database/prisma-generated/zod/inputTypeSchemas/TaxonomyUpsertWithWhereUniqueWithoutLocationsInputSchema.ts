import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutLocationsInputSchema } from './TaxonomyUpdateWithoutLocationsInputSchema';
import { TaxonomyUncheckedUpdateWithoutLocationsInputSchema } from './TaxonomyUncheckedUpdateWithoutLocationsInputSchema';
import { TaxonomyCreateWithoutLocationsInputSchema } from './TaxonomyCreateWithoutLocationsInputSchema';
import { TaxonomyUncheckedCreateWithoutLocationsInputSchema } from './TaxonomyUncheckedCreateWithoutLocationsInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithoutLocationsInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutLocationsInputSchema) ]),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default TaxonomyUpsertWithWhereUniqueWithoutLocationsInputSchema;
