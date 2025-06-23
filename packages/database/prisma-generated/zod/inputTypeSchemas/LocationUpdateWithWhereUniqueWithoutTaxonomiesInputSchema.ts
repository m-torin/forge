import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutTaxonomiesInputSchema } from './LocationUpdateWithoutTaxonomiesInputSchema';
import { LocationUncheckedUpdateWithoutTaxonomiesInputSchema } from './LocationUncheckedUpdateWithoutTaxonomiesInputSchema';

export const LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateWithWhereUniqueWithoutTaxonomiesInputSchema;
