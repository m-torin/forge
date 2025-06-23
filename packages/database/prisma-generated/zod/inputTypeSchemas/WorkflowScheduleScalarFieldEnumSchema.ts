import { z } from 'zod';

export const WorkflowScheduleScalarFieldEnumSchema = z.enum([
  'id',
  'configId',
  'name',
  'description',
  'cronExpression',
  'timezone',
  'isActive',
  'payload',
  'nextRunAt',
  'lastRunAt',
  'lastRunStatus',
  'totalRuns',
  'successfulRuns',
  'failedRuns',
  'validFrom',
  'validUntil',
  'createdAt',
  'updatedAt',
  'createdBy',
]);

export default WorkflowScheduleScalarFieldEnumSchema;
