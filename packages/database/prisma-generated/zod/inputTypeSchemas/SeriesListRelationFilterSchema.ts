import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';

export const SeriesListRelationFilterSchema: z.ZodType<Prisma.SeriesListRelationFilter> = z.object({
  every: z.lazy(() => SeriesWhereInputSchema).optional(),
  some: z.lazy(() => SeriesWhereInputSchema).optional(),
  none: z.lazy(() => SeriesWhereInputSchema).optional()
}).strict();

export default SeriesListRelationFilterSchema;
