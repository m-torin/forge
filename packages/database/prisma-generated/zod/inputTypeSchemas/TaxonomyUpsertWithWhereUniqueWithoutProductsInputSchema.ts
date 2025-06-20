import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyUpdateWithoutProductsInputSchema } from './TaxonomyUpdateWithoutProductsInputSchema';
import { TaxonomyUncheckedUpdateWithoutProductsInputSchema } from './TaxonomyUncheckedUpdateWithoutProductsInputSchema';
import { TaxonomyCreateWithoutProductsInputSchema } from './TaxonomyCreateWithoutProductsInputSchema';
import { TaxonomyUncheckedCreateWithoutProductsInputSchema } from './TaxonomyUncheckedCreateWithoutProductsInputSchema';

export const TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TaxonomyUpdateWithoutProductsInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutProductsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default TaxonomyUpsertWithWhereUniqueWithoutProductsInputSchema;
