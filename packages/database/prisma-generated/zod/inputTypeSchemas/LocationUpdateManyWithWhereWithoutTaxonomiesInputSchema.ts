import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutTaxonomiesInputSchema } from './LocationUncheckedUpdateManyWithoutTaxonomiesInputSchema';

export const LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => LocationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateManyMutationInputSchema),z.lazy(() => LocationUncheckedUpdateManyWithoutTaxonomiesInputSchema) ]),
}).strict();

export default LocationUpdateManyWithWhereWithoutTaxonomiesInputSchema;
