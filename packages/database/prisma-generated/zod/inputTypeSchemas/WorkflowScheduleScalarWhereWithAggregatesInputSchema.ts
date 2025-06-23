import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const WorkflowScheduleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WorkflowScheduleScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => WorkflowScheduleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => WorkflowScheduleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => WorkflowScheduleScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => WorkflowScheduleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => WorkflowScheduleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      configId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      description: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      cronExpression: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      timezone: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      isActive: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      payload: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      nextRunAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      lastRunAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      lastRunStatus: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      totalRuns: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      successfulRuns: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      failedRuns: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      validFrom: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      validUntil: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default WorkflowScheduleScalarWhereWithAggregatesInputSchema;
