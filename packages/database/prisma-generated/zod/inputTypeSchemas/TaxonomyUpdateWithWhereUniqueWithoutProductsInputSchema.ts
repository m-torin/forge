import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutProductsInputSchema } from './TaxonomyUpdateWithoutProductsInputSchema';
import { TaxonomyUncheckedUpdateWithoutProductsInputSchema } from './TaxonomyUncheckedUpdateWithoutProductsInputSchema';

export const TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.TaxonomyUpdateWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TaxonomyUpdateWithoutProductsInputSchema),
        z.lazy(() => TaxonomyUncheckedUpdateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyUpdateWithWhereUniqueWithoutProductsInputSchema;
