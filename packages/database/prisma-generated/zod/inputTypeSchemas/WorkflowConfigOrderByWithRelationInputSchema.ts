import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { WorkflowScheduleOrderByRelationAggregateInputSchema } from './WorkflowScheduleOrderByRelationAggregateInputSchema';

export const WorkflowConfigOrderByWithRelationInputSchema: z.ZodType<Prisma.WorkflowConfigOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      workflowSlug: z.lazy(() => SortOrderSchema).optional(),
      organizationId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      isEnabled: z.lazy(() => SortOrderSchema).optional(),
      displayName: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      category: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      tags: z.lazy(() => SortOrderSchema).optional(),
      notifyOnStart: z.lazy(() => SortOrderSchema).optional(),
      notifyOnComplete: z.lazy(() => SortOrderSchema).optional(),
      notifyOnFailure: z.lazy(() => SortOrderSchema).optional(),
      notifyOnApproval: z.lazy(() => SortOrderSchema).optional(),
      notificationEmail: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      maxRetries: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      timeoutSeconds: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      rateLimitPerHour: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      maxConcurrent: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      priority: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      customPayload: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      schedules: z.lazy(() => WorkflowScheduleOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default WorkflowConfigOrderByWithRelationInputSchema;
