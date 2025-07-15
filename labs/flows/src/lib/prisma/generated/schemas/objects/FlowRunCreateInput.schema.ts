import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { FlowCreateNestedOneWithoutFlowRunsInputObjectSchema } from './FlowCreateNestedOneWithoutFlowRunsInput.schema';
import { FlowEventCreateNestedManyWithoutFlowRunInputObjectSchema } from './FlowEventCreateNestedManyWithoutFlowRunInput.schema';
import { ScheduledJobCreateNestedOneWithoutFlowRunsInputObjectSchema } from './ScheduledJobCreateNestedOneWithoutFlowRunsInput.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<any> = z
  .object({
    isScheduled: z.boolean().optional().nullable(),
    payload: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    runStatus: RunStatusSchema,
    startedBy: StartedBySchema,
    timeEnded: z.coerce.date().optional().nullable(),
    timeStarted: z.coerce.date().optional(),
    flow: z.lazy(() => FlowCreateNestedOneWithoutFlowRunsInputObjectSchema),
    flowEvents: z
      .lazy(() => FlowEventCreateNestedManyWithoutFlowRunInputObjectSchema)
      .optional(),
    scheduledJob: z
      .lazy(() => ScheduledJobCreateNestedOneWithoutFlowRunsInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowRunCreateInputObjectSchema = Schema;
