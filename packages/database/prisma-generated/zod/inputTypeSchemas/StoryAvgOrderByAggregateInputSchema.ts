import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const StoryAvgOrderByAggregateInputSchema: z.ZodType<Prisma.StoryAvgOrderByAggregateInput> = z.object({
  displayOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default StoryAvgOrderByAggregateInputSchema;
