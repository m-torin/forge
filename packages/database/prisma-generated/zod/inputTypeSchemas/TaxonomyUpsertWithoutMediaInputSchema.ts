import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyUpdateWithoutMediaInputSchema } from './TaxonomyUpdateWithoutMediaInputSchema';
import { TaxonomyUncheckedUpdateWithoutMediaInputSchema } from './TaxonomyUncheckedUpdateWithoutMediaInputSchema';
import { TaxonomyCreateWithoutMediaInputSchema } from './TaxonomyCreateWithoutMediaInputSchema';
import { TaxonomyUncheckedCreateWithoutMediaInputSchema } from './TaxonomyUncheckedCreateWithoutMediaInputSchema';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';

export const TaxonomyUpsertWithoutMediaInputSchema: z.ZodType<Prisma.TaxonomyUpsertWithoutMediaInput> = z.object({
  update: z.union([ z.lazy(() => TaxonomyUpdateWithoutMediaInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutMediaInputSchema) ]),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutMediaInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutMediaInputSchema) ]),
  where: z.lazy(() => TaxonomyWhereInputSchema).optional()
}).strict();

export default TaxonomyUpsertWithoutMediaInputSchema;
