import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutLocationsInputSchema } from './TaxonomyCreateWithoutLocationsInputSchema';
import { TaxonomyUncheckedCreateWithoutLocationsInputSchema } from './TaxonomyUncheckedCreateWithoutLocationsInputSchema';

export const TaxonomyCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutLocationsInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyCreateOrConnectWithoutLocationsInputSchema;
