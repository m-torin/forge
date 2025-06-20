import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowConfigIncludeSchema } from '../inputTypeSchemas/WorkflowConfigIncludeSchema'
import { WorkflowConfigWhereInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereInputSchema'
import { WorkflowConfigOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorkflowConfigOrderByWithRelationInputSchema'
import { WorkflowConfigWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowConfigWhereUniqueInputSchema'
import { WorkflowConfigScalarFieldEnumSchema } from '../inputTypeSchemas/WorkflowConfigScalarFieldEnumSchema'
import { WorkflowScheduleFindManyArgsSchema } from "../outputTypeSchemas/WorkflowScheduleFindManyArgsSchema"
import { WorkflowConfigCountOutputTypeArgsSchema } from "../outputTypeSchemas/WorkflowConfigCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorkflowConfigSelectSchema: z.ZodType<Prisma.WorkflowConfigSelect> = z.object({
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
  schedules: z.union([z.boolean(),z.lazy(() => WorkflowScheduleFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => WorkflowConfigCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const WorkflowConfigFindFirstOrThrowArgsSchema: z.ZodType<Prisma.WorkflowConfigFindFirstOrThrowArgs> = z.object({
  select: WorkflowConfigSelectSchema.optional(),
  include: z.lazy(() => WorkflowConfigIncludeSchema).optional(),
  where: WorkflowConfigWhereInputSchema.optional(),
  orderBy: z.union([ WorkflowConfigOrderByWithRelationInputSchema.array(),WorkflowConfigOrderByWithRelationInputSchema ]).optional(),
  cursor: WorkflowConfigWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WorkflowConfigScalarFieldEnumSchema,WorkflowConfigScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default WorkflowConfigFindFirstOrThrowArgsSchema;
