import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';

export const TaxonomyListRelationFilterSchema: z.ZodType<Prisma.TaxonomyListRelationFilter> = z
  .object({
    every: z.lazy(() => TaxonomyWhereInputSchema).optional(),
    some: z.lazy(() => TaxonomyWhereInputSchema).optional(),
    none: z.lazy(() => TaxonomyWhereInputSchema).optional(),
  })
  .strict();

export default TaxonomyListRelationFilterSchema;
