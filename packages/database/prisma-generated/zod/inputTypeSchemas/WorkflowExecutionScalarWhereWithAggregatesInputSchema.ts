import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { IntNullableWithAggregatesFilterSchema } from './IntNullableWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';

export const WorkflowExecutionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.WorkflowExecutionScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => WorkflowExecutionScalarWhereWithAggregatesInputSchema),
          z.lazy(() => WorkflowExecutionScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => WorkflowExecutionScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => WorkflowExecutionScalarWhereWithAggregatesInputSchema),
          z.lazy(() => WorkflowExecutionScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      workflowRunId: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      workflowSlug: z
        .union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()])
        .optional(),
      userId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      organizationId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      status: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      startedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      completedAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      duration: z
        .union([z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      inputPayloadHash: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      hasOutput: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      error: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      errorType: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      stepCount: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      completedSteps: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      retryCount: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      triggeredBy: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      triggerSource: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      parentExecutionId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      creditsUsed: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      apiCallCount: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      tags: z.lazy(() => StringNullableListFilterSchema).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
    })
    .strict();

export default WorkflowExecutionScalarWhereWithAggregatesInputSchema;
