import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema } from './WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema';
import { WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema } from './WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema';
import { WorkflowConfigWhereInputSchema } from './WorkflowConfigWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { WorkflowScheduleListRelationFilterSchema } from './WorkflowScheduleListRelationFilterSchema';

export const WorkflowConfigWhereUniqueInputSchema: z.ZodType<Prisma.WorkflowConfigWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    workflowSlug_organizationId: z.lazy(() => WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema),
    workflowSlug_userId: z.lazy(() => WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
    workflowSlug_organizationId: z.lazy(() => WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.string().cuid(),
    workflowSlug_userId: z.lazy(() => WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    workflowSlug_organizationId: z.lazy(() => WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema),
    workflowSlug_userId: z.lazy(() => WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema),
  }),
  z.object({
    workflowSlug_organizationId: z.lazy(() => WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema),
  }),
  z.object({
    workflowSlug_userId: z.lazy(() => WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  workflowSlug_organizationId: z.lazy(() => WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema).optional(),
  workflowSlug_userId: z.lazy(() => WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => WorkflowConfigWhereInputSchema),z.lazy(() => WorkflowConfigWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorkflowConfigWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorkflowConfigWhereInputSchema),z.lazy(() => WorkflowConfigWhereInputSchema).array() ]).optional(),
  workflowSlug: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  organizationId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isEnabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  displayName: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  category: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  tags: z.lazy(() => StringNullableListFilterSchema).optional(),
  notifyOnStart: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notifyOnComplete: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notifyOnFailure: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notifyOnApproval: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  notificationEmail: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  maxRetries: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  timeoutSeconds: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  rateLimitPerHour: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  maxConcurrent: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntNullableFilterSchema),z.number().int() ]).optional().nullable(),
  customPayload: z.lazy(() => JsonNullableFilterSchema).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  schedules: z.lazy(() => WorkflowScheduleListRelationFilterSchema).optional()
}).strict());

export default WorkflowConfigWhereUniqueInputSchema;
