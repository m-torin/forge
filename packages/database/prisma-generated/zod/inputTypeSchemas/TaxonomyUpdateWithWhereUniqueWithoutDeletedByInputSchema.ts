import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutDeletedByInputSchema } from './TaxonomyUpdateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedUpdateWithoutDeletedByInputSchema } from './TaxonomyUncheckedUpdateWithoutDeletedByInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateWithoutDeletedByInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateWithWhereUniqueWithoutDeletedByInputSchema;
