import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleIncludeSchema } from '../inputTypeSchemas/WorkflowScheduleIncludeSchema'
import { WorkflowScheduleWhereInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereInputSchema'
import { WorkflowScheduleOrderByWithRelationInputSchema } from '../inputTypeSchemas/WorkflowScheduleOrderByWithRelationInputSchema'
import { WorkflowScheduleWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereUniqueInputSchema'
import { WorkflowScheduleScalarFieldEnumSchema } from '../inputTypeSchemas/WorkflowScheduleScalarFieldEnumSchema'
import { WorkflowConfigArgsSchema } from "../outputTypeSchemas/WorkflowConfigArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorkflowScheduleSelectSchema: z.ZodType<Prisma.WorkflowScheduleSelect> = z.object({
  id: z.boolean().optional(),
  configId: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  cronExpression: z.boolean().optional(),
  timezone: z.boolean().optional(),
  isActive: z.boolean().optional(),
  payload: z.boolean().optional(),
  nextRunAt: z.boolean().optional(),
  lastRunAt: z.boolean().optional(),
  lastRunStatus: z.boolean().optional(),
  totalRuns: z.boolean().optional(),
  successfulRuns: z.boolean().optional(),
  failedRuns: z.boolean().optional(),
  validFrom: z.boolean().optional(),
  validUntil: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  config: z.union([z.boolean(),z.lazy(() => WorkflowConfigArgsSchema)]).optional(),
}).strict()

export const WorkflowScheduleFindFirstOrThrowArgsSchema: z.ZodType<Prisma.WorkflowScheduleFindFirstOrThrowArgs> = z.object({
  select: WorkflowScheduleSelectSchema.optional(),
  include: z.lazy(() => WorkflowScheduleIncludeSchema).optional(),
  where: WorkflowScheduleWhereInputSchema.optional(),
  orderBy: z.union([ WorkflowScheduleOrderByWithRelationInputSchema.array(),WorkflowScheduleOrderByWithRelationInputSchema ]).optional(),
  cursor: WorkflowScheduleWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ WorkflowScheduleScalarFieldEnumSchema,WorkflowScheduleScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default WorkflowScheduleFindFirstOrThrowArgsSchema;
