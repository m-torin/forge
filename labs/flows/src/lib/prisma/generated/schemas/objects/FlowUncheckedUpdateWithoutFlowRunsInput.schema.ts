import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { BoolFieldUpdateOperationsInputObjectSchema } from './BoolFieldUpdateOperationsInput.schema';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { EnumFlowMethodFieldUpdateOperationsInputObjectSchema } from './EnumFlowMethodFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { EdgeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './EdgeUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { FlowEventUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './FlowEventUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { NodeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './NodeUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { SecretUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './SecretUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { TagUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './TagUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { TestCaseUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './TestCaseUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { AuditLogUncheckedUpdateManyWithoutFlowNestedInputObjectSchema } from './AuditLogUncheckedUpdateManyWithoutFlowNestedInput.schema';
import { FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputObjectSchema } from './FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInput.schema';

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
    createdAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    id: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    instanceId: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    isEnabled: z
      .union([
        z.boolean(),
        z.lazy(() => BoolFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    method: z
      .union([
        FlowMethodSchema,
        z.lazy(() => EnumFlowMethodFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    name: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    viewport: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    deleted: z
      .union([
        z.boolean(),
        z.lazy(() => BoolFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    edges: z
      .lazy(() => EdgeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    flowEvents: z
      .lazy(
        () => FlowEventUncheckedUpdateManyWithoutFlowNestedInputObjectSchema,
      )
      .optional(),
    nodes: z
      .lazy(() => NodeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    testCases: z
      .lazy(() => TestCaseUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogUncheckedUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    statistics: z
      .lazy(
        () =>
          FlowStatisticsUncheckedUpdateOneWithoutFlowNestedInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema = Schema;
