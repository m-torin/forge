import { z } from 'zod';
import type { Prisma } from '../../client';
import { WorkflowScheduleIncludeSchema } from '../inputTypeSchemas/WorkflowScheduleIncludeSchema';
import { WorkflowScheduleWhereUniqueInputSchema } from '../inputTypeSchemas/WorkflowScheduleWhereUniqueInputSchema';
import { WorkflowScheduleCreateInputSchema } from '../inputTypeSchemas/WorkflowScheduleCreateInputSchema';
import { WorkflowScheduleUncheckedCreateInputSchema } from '../inputTypeSchemas/WorkflowScheduleUncheckedCreateInputSchema';
import { WorkflowScheduleUpdateInputSchema } from '../inputTypeSchemas/WorkflowScheduleUpdateInputSchema';
import { WorkflowScheduleUncheckedUpdateInputSchema } from '../inputTypeSchemas/WorkflowScheduleUncheckedUpdateInputSchema';
import { WorkflowConfigArgsSchema } from '../outputTypeSchemas/WorkflowConfigArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const WorkflowScheduleSelectSchema: z.ZodType<Prisma.WorkflowScheduleSelect> = z
  .object({
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
    config: z.union([z.boolean(), z.lazy(() => WorkflowConfigArgsSchema)]).optional(),
  })
  .strict();

export const WorkflowScheduleUpsertArgsSchema: z.ZodType<Prisma.WorkflowScheduleUpsertArgs> = z
  .object({
    select: WorkflowScheduleSelectSchema.optional(),
    include: z.lazy(() => WorkflowScheduleIncludeSchema).optional(),
    where: WorkflowScheduleWhereUniqueInputSchema,
    create: z.union([
      WorkflowScheduleCreateInputSchema,
      WorkflowScheduleUncheckedCreateInputSchema,
    ]),
    update: z.union([
      WorkflowScheduleUpdateInputSchema,
      WorkflowScheduleUncheckedUpdateInputSchema,
    ]),
  })
  .strict();

export default WorkflowScheduleUpsertArgsSchema;
