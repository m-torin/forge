import { z } from 'zod';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { IntFieldUpdateOperationsInputObjectSchema } from './IntFieldUpdateOperationsInput.schema';
import { NullableBoolFieldUpdateOperationsInputObjectSchema } from './NullableBoolFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { EnumRunStatusFieldUpdateOperationsInputObjectSchema } from './EnumRunStatusFieldUpdateOperationsInput.schema';
import { NullableIntFieldUpdateOperationsInputObjectSchema } from './NullableIntFieldUpdateOperationsInput.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { EnumStartedByFieldUpdateOperationsInputObjectSchema } from './EnumStartedByFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputObjectSchema } from './FlowEventUncheckedUpdateManyWithoutFlowRunNestedInput.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<Prisma.FlowRunUncheckedUpdateInput> = z
  .object({
    flowId: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    id: z
      .union([
        z.number().int(),
        z.lazy(() => IntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
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
    scheduledJobId: z
      .union([
        z.number().int(),
        z.lazy(() => NullableIntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
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
      .lazy(
        () => FlowEventUncheckedUpdateManyWithoutFlowRunNestedInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const FlowRunUncheckedUpdateInputObjectSchema = Schema;
