import { z } from 'zod';
import { NullableBoolFieldUpdateOperationsInputObjectSchema } from './NullableBoolFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { EnumRunStatusFieldUpdateOperationsInputObjectSchema } from './EnumRunStatusFieldUpdateOperationsInput.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { EnumStartedByFieldUpdateOperationsInputObjectSchema } from './EnumStartedByFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { FlowEventUpdateManyWithoutFlowRunNestedInputObjectSchema } from './FlowEventUpdateManyWithoutFlowRunNestedInput.schema';
import { ScheduledJobUpdateOneWithoutFlowRunsNestedInputObjectSchema } from './ScheduledJobUpdateOneWithoutFlowRunsNestedInput.schema';

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
    isScheduled: z
      .union([
        z.boolean(),
        z.lazy(() => NullableBoolFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    payload: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    runStatus: z
      .union([
        RunStatusSchema,
        z.lazy(() => EnumRunStatusFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    startedBy: z
      .union([
        StartedBySchema,
        z.lazy(() => EnumStartedByFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    timeEnded: z
      .union([
        z.coerce.date(),
        z.lazy(() => NullableDateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    timeStarted: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    flowEvents: z
      .lazy(() => FlowEventUpdateManyWithoutFlowRunNestedInputObjectSchema)
      .optional(),
    scheduledJob: z
      .lazy(() => ScheduledJobUpdateOneWithoutFlowRunsNestedInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowRunUpdateWithoutFlowInputObjectSchema = Schema;
