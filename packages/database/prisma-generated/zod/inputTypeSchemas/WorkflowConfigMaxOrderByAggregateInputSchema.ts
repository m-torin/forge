import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const WorkflowConfigMaxOrderByAggregateInputSchema: z.ZodType<Prisma.WorkflowConfigMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  workflowSlug: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isEnabled: z.lazy(() => SortOrderSchema).optional(),
  displayName: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => SortOrderSchema).optional(),
  notifyOnStart: z.lazy(() => SortOrderSchema).optional(),
  notifyOnComplete: z.lazy(() => SortOrderSchema).optional(),
  notifyOnFailure: z.lazy(() => SortOrderSchema).optional(),
  notifyOnApproval: z.lazy(() => SortOrderSchema).optional(),
  notificationEmail: z.lazy(() => SortOrderSchema).optional(),
  maxRetries: z.lazy(() => SortOrderSchema).optional(),
  timeoutSeconds: z.lazy(() => SortOrderSchema).optional(),
  rateLimitPerHour: z.lazy(() => SortOrderSchema).optional(),
  maxConcurrent: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  createdBy: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default WorkflowConfigMaxOrderByAggregateInputSchema;
