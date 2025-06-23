import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorkflowConfigOrderByWithRelationInputSchema } from './WorkflowConfigOrderByWithRelationInputSchema';

export const WorkflowScheduleOrderByWithRelationInputSchema: z.ZodType<Prisma.WorkflowScheduleOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      configId: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      cronExpression: z.lazy(() => SortOrderSchema).optional(),
      timezone: z.lazy(() => SortOrderSchema).optional(),
      isActive: z.lazy(() => SortOrderSchema).optional(),
      payload: z.lazy(() => SortOrderSchema).optional(),
      nextRunAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRunAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRunStatus: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      totalRuns: z.lazy(() => SortOrderSchema).optional(),
      successfulRuns: z.lazy(() => SortOrderSchema).optional(),
      failedRuns: z.lazy(() => SortOrderSchema).optional(),
      validFrom: z.lazy(() => SortOrderSchema).optional(),
      validUntil: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      config: z.lazy(() => WorkflowConfigOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default WorkflowScheduleOrderByWithRelationInputSchema;
