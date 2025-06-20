import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowExecutionSumOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowExecutionSumOrderByAggregateInput> = z.object({
  duration: z.lazy(() => SortOrderSchema).optional(),
  stepCount: z.lazy(() => SortOrderSchema).optional(),
  completedSteps: z.lazy(() => SortOrderSchema).optional(),
  retryCount: z.lazy(() => SortOrderSchema).optional(),
  creditsUsed: z.lazy(() => SortOrderSchema).optional(),
  apiCallCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorkflowExecutionSumOrderByAggregateInputSchema;
