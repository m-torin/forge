import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyScalarWhereInputSchema } from './TaxonomyScalarWhereInputSchema';
import { TaxonomyUpdateManyMutationInputSchema } from './TaxonomyUpdateManyMutationInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutPdpJoinsInputSchema } from './TaxonomyUncheckedUpdateManyWithoutPdpJoinsInputSchema';

export const TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema: z.ZodType<Prisma.TaxonomyUpdateManyWithWhereWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateManyMutationInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateManyWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateManyWithWhereWithoutPdpJoinsInputSchema;
