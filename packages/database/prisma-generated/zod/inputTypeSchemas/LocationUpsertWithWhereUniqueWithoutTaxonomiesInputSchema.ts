import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutTaxonomiesInputSchema } from './LocationUpdateWithoutTaxonomiesInputSchema';
import { LocationUncheckedUpdateWithoutTaxonomiesInputSchema } from './LocationUncheckedUpdateWithoutTaxonomiesInputSchema';
import { LocationCreateWithoutTaxonomiesInputSchema } from './LocationCreateWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateWithoutTaxonomiesInputSchema';

export const LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutTaxonomiesInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutTaxonomiesInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutTaxonomiesInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema),z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema) ]),
}).strict();

export default LocationUpsertWithWhereUniqueWithoutTaxonomiesInputSchema;
