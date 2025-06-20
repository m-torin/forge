import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowConfigAvgOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowConfigAvgOrderByAggregateInput> = z.object({
  maxRetries: z.lazy(() => SortOrderSchema).optional(),
  timeoutSeconds: z.lazy(() => SortOrderSchema).optional(),
  rateLimitPerHour: z.lazy(() => SortOrderSchema).optional(),
  maxConcurrent: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorkflowConfigAvgOrderByAggregateInputSchema;
