import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// WORKFLOW SCHEDULE SCHEMA
/////////////////////////////////////////

export const WorkflowScheduleSchema = z.object({
  id: z.string().cuid(),
  configId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  cronExpression: z.string(),
  timezone: z.string(),
  isActive: z.boolean(),
  payload: JsonValueSchema,
  nextRunAt: z.coerce.date().nullable(),
  lastRunAt: z.coerce.date().nullable(),
  lastRunStatus: z.string().nullable(),
  totalRuns: z.number().int(),
  successfulRuns: z.number().int(),
  failedRuns: z.number().int(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
})

export type WorkflowSchedule = z.infer<typeof WorkflowScheduleSchema>

export default WorkflowScheduleSchema;
