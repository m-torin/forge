import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const SeriesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.SeriesAvgOrderByAggregateInput> = z.object({
  displayOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default SeriesAvgOrderByAggregateInputSchema;
