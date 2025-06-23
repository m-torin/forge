import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutTaxonomiesInputSchema } from './LocationCreateWithoutTaxonomiesInputSchema';
import { LocationUncheckedCreateWithoutTaxonomiesInputSchema } from './LocationUncheckedCreateWithoutTaxonomiesInputSchema';

export const LocationCreateOrConnectWithoutTaxonomiesInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => LocationCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default LocationCreateOrConnectWithoutTaxonomiesInputSchema;
