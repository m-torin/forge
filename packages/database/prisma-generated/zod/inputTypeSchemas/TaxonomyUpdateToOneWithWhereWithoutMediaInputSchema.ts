import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';
import { TaxonomyUpdateWithoutMediaInputSchema } from './TaxonomyUpdateWithoutMediaInputSchema';
import { TaxonomyUncheckedUpdateWithoutMediaInputSchema } from './TaxonomyUncheckedUpdateWithoutMediaInputSchema';

export const TaxonomyUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.TaxonomyUpdateToOneWithWhereWithoutMediaInput> = z.object({
  where: z.lazy(() => TaxonomyWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TaxonomyUpdateWithoutMediaInputSchema),z.lazy(() => TaxonomyUncheckedUpdateWithoutMediaInputSchema) ]),
}).strict();

export default TaxonomyUpdateToOneWithWhereWithoutMediaInputSchema;
