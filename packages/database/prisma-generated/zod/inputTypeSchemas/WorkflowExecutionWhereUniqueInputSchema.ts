import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowExecutionWhereInputSchema } from './WorkflowExecutionWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';

export const WorkflowExecutionWhereUniqueInputSchema: z.ZodType<Prisma.WorkflowExecutionWhereUniqueInput> =
  z
    .union([
      z.object({
        id: z.string().cuid(),
        workflowRunId: z.string(),
      }),
      z.object({
        id: z.string().cuid(),
      }),
      z.object({
        workflowRunId: z.string(),
      }),
    ])
    .and(
      z
        .object({
          id: z.string().cuid().optional(),
          workflowRunId: z.string().optional(),
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
            .union([z.lazy(() => IntNullableFilterSchema), z.number().int()])
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
          stepCount: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          completedSteps: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          retryCount: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          triggeredBy: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
          triggerSource: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          parentExecutionId: z
            .union([z.lazy(() => StringNullableFilterSchema), z.string()])
            .optional()
            .nullable(),
          creditsUsed: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          apiCallCount: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
          tags: z.lazy(() => StringNullableListFilterSchema).optional(),
          createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
          updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        })
        .strict(),
    );

export default WorkflowExecutionWhereUniqueInputSchema;
