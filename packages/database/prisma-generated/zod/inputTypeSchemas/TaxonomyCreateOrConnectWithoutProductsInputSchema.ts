import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutProductsInputSchema } from './TaxonomyCreateWithoutProductsInputSchema';
import { TaxonomyUncheckedCreateWithoutProductsInputSchema } from './TaxonomyUncheckedCreateWithoutProductsInputSchema';

export const TaxonomyCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutProductsInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default TaxonomyCreateOrConnectWithoutProductsInputSchema;
