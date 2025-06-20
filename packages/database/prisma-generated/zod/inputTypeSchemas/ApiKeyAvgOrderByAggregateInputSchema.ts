import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ApiKeyAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ApiKeyAvgOrderByAggregateInput> = z.object({
  refillInterval: z.lazy(() => SortOrderSchema).optional(),
  refillAmount: z.lazy(() => SortOrderSchema).optional(),
  rateLimitTimeWindow: z.lazy(() => SortOrderSchema).optional(),
  rateLimitMax: z.lazy(() => SortOrderSchema).optional(),
  requestCount: z.lazy(() => SortOrderSchema).optional(),
  remaining: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ApiKeyAvgOrderByAggregateInputSchema;
