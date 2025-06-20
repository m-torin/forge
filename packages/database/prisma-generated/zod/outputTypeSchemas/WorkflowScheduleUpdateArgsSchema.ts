import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleIncludeSchema } from '../inputTypeSchemas/WorkflowScheduleIncludeSchema'
import { WorkflowScheduleUpdateInputSchema } from '../inputTypeSchemas/WorkflowScheduleUpdateInputSchema'
import { WorkflowScheduleUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorkflowScheduleUncheckedUpdateInputSchema'
import { WorkflowScheduleWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereUniqueInputSchema'
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

export const WorkflowScheduleUpdateArgsSchema: z.ZodType<Prisma.WorkflowScheduleUpdateArgs> = z.object({
  select: WorkflowScheduleSelectSchema.optional(),
  include: z.lazy(() => WorkflowScheduleIncludeSchema).optional(),
  data: z.union([ WorkflowScheduleUpdateInputSchema,WorkflowScheduleUncheckedUpdateInputSchema ]),
  where: WorkflowScheduleWhereUniqueInputSchema,
}).strict() ;

export default WorkflowScheduleUpdateArgsSchema;
