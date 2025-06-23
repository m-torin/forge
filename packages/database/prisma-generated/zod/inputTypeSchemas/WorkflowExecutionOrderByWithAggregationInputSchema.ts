import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorkflowExecutionCountOrderByAggregateInputSchema } from './WorkflowExecutionCountOrderByAggregateInputSchema';
import { WorkflowExecutionAvgOrderByAggregateInputSchema } from './WorkflowExecutionAvgOrderByAggregateInputSchema';
import { WorkflowExecutionMaxOrderByAggregateInputSchema } from './WorkflowExecutionMaxOrderByAggregateInputSchema';
import { WorkflowExecutionMinOrderByAggregateInputSchema } from './WorkflowExecutionMinOrderByAggregateInputSchema';
import { WorkflowExecutionSumOrderByAggregateInputSchema } from './WorkflowExecutionSumOrderByAggregateInputSchema';

export const WorkflowExecutionOrderByWithAggregationInputSchema: z.ZodType<Prisma.WorkflowExecutionOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      workflowRunId: z.lazy(() => SortOrderSchema).optional(),
      workflowSlug: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      organizationId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      startedAt: z.lazy(() => SortOrderSchema).optional(),
      completedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      duration: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      inputPayloadHash: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      hasOutput: z.lazy(() => SortOrderSchema).optional(),
      error: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      errorType: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      stepCount: z.lazy(() => SortOrderSchema).optional(),
      completedSteps: z.lazy(() => SortOrderSchema).optional(),
      retryCount: z.lazy(() => SortOrderSchema).optional(),
      triggeredBy: z.lazy(() => SortOrderSchema).optional(),
      triggerSource: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      parentExecutionId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      creditsUsed: z.lazy(() => SortOrderSchema).optional(),
      apiCallCount: z.lazy(() => SortOrderSchema).optional(),
      tags: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => WorkflowExecutionCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => WorkflowExecutionAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => WorkflowExecutionMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => WorkflowExecutionMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => WorkflowExecutionSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default WorkflowExecutionOrderByWithAggregationInputSchema;
