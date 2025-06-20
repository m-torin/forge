import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const WorkflowScheduleScalarWhereInputSchema: z.ZodType<Prisma.WorkflowScheduleScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => WorkflowScheduleScalarWhereInputSchema),z.lazy(() => WorkflowScheduleScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => WorkflowScheduleScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => WorkflowScheduleScalarWhereInputSchema),z.lazy(() => WorkflowScheduleScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  configId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  cronExpression: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timezone: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  payload: z.lazy(() => JsonFilterSchema).optional(),
  nextRunAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  lastRunAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  lastRunStatus: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  totalRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  successfulRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  failedRuns: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  validFrom: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  validUntil: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default WorkflowScheduleScalarWhereInputSchema;
