import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutDeletedByInputSchema } from './TaxonomyCreateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedCreateWithoutDeletedByInputSchema } from './TaxonomyUncheckedCreateWithoutDeletedByInputSchema';

export const TaxonomyCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema),
        z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default TaxonomyCreateOrConnectWithoutDeletedByInputSchema;
