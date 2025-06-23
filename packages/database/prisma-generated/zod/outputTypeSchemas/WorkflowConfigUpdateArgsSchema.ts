import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigIncludeSchema } from '../inputTypeSchemas/WorkflowConfigIncludeSchema';
import { WorkflowConfigUpdateInputSchema } from '../inputTypeSchemas/WorkflowConfigUpdateInputSchema';
import { WorkflowConfigUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorkflowConfigUncheckedUpdateInputSchema';
import { WorkflowConfigWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereUniqueInputSchema';
import { WorkflowScheduleFindManyArgsSchema } from '../outputTypeSchemas/WorkflowScheduleFindManyArgsSchema';
import { WorkflowConfigCountOutputTypeArgsSchema } from '../outputTypeSchemas/WorkflowConfigCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorkflowConfigSelectSchema: z.ZodType<Prisma.WorkflowConfigSelect> = z
  .object({
    id: z.boolean().optional(),
    workflowSlug: z.boolean().optional(),
    organizationId: z.boolean().optional(),
    userId: z.boolean().optional(),
    isEnabled: z.boolean().optional(),
    displayName: z.boolean().optional(),
    description: z.boolean().optional(),
    category: z.boolean().optional(),
    tags: z.boolean().optional(),
    notifyOnStart: z.boolean().optional(),
    notifyOnComplete: z.boolean().optional(),
    notifyOnFailure: z.boolean().optional(),
    notifyOnApproval: z.boolean().optional(),
    notificationEmail: z.boolean().optional(),
    maxRetries: z.boolean().optional(),
    timeoutSeconds: z.boolean().optional(),
    rateLimitPerHour: z.boolean().optional(),
    maxConcurrent: z.boolean().optional(),
    priority: z.boolean().optional(),
    customPayload: z.boolean().optional(),
    metadata: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    schedules: z.union([z.boolean(), z.lazy(() => WorkflowScheduleFindManyArgsSchema)]).optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => WorkflowConfigCountOutputTypeArgsSchema)])
      .optional(),
  })
  .strict();

export const WorkflowConfigUpdateArgsSchema: z.ZodType<Prisma.WorkflowConfigUpdateArgs> = z
  .object({
    select: WorkflowConfigSelectSchema.optional(),
    include: z.lazy(() => WorkflowConfigIncludeSchema).optional(),
    data: z.union([WorkflowConfigUpdateInputSchema, WorkflowConfigUncheckedUpdateInputSchema]),
    where: WorkflowConfigWhereUniqueInputSchema,
  })
  .strict();

export default WorkflowConfigUpdateArgsSchema;
