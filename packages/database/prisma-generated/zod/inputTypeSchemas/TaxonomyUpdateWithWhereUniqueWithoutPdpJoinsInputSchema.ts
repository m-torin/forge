import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutPdpJoinsInputSchema } from './TaxonomyUpdateWithoutPdpJoinsInputSchema';
import { TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateWithoutPdpJoinsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateWithWhereUniqueWithoutPdpJoinsInputSchema;
