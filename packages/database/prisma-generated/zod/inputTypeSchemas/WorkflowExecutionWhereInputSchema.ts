import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';

export const WorkflowExecutionWhereInputSchema: z.ZodType<Prisma.WorkflowExecutionWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => WorkflowExecutionWhereInputSchema),
        z.lazy(() => WorkflowExecutionWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => WorkflowExecutionWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => WorkflowExecutionWhereInputSchema),
        z.lazy(() => WorkflowExecutionWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    workflowRunId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    workflowSlug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    organizationId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    status: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    startedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    completedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    duration: z
      .union([z.lazy(() => IntNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    inputPayloadHash: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    hasOutput: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    error: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    errorType: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    stepCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    completedSteps: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    retryCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    triggeredBy: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    triggerSource: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    parentExecutionId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    creditsUsed: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    apiCallCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    tags: z.lazy(() => StringNullableListFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  })
  .strict();

export default WorkflowExecutionWhereInputSchema;
