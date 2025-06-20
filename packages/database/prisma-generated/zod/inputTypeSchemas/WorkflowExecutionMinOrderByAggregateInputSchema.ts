import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowExecutionMinOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowExecutionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  workflowRunId: z.lazy(() => SortOrderSchema).optional(),
  workflowSlug: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  startedAt: z.lazy(() => SortOrderSchema).optional(),
  completedAt: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  inputPayloadHash: z.lazy(() => SortOrderSchema).optional(),
  hasOutput: z.lazy(() => SortOrderSchema).optional(),
  error: z.lazy(() => SortOrderSchema).optional(),
  errorType: z.lazy(() => SortOrderSchema).optional(),
  stepCount: z.lazy(() => SortOrderSchema).optional(),
  completedSteps: z.lazy(() => SortOrderSchema).optional(),
  retryCount: z.lazy(() => SortOrderSchema).optional(),
  triggeredBy: z.lazy(() => SortOrderSchema).optional(),
  triggerSource: z.lazy(() => SortOrderSchema).optional(),
  parentExecutionId: z.lazy(() => SortOrderSchema).optional(),
  creditsUsed: z.lazy(() => SortOrderSchema).optional(),
  apiCallCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorkflowExecutionMinOrderByAggregateInputSchema;
