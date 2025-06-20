import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutDeletedByInputSchema } from './TaxonomyUpdateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedUpdateWithoutDeletedByInputSchema } from './TaxonomyUncheckedUpdateWithoutDeletedByInputSchema';
import { TaxonomyCreateWithoutDeletedByInputSchema } from './TaxonomyCreateWithoutDeletedByInputSchema';
import { TaxonomyUncheckedCreateWithoutDeletedByInputSchema } from './TaxonomyUncheckedCreateWithoutDeletedByInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutDeletedByInputSchema) ]),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutDeletedByInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default TaxonomyUpsertWithWhereUniqueWithoutDeletedByInputSchema;
