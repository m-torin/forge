import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { BoolFieldUpdateOperationsInputObjectSchema } from './BoolFieldUpdateOperationsInput.schema';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { EnumFlowMethodFieldUpdateOperationsInputObjectSchema } from './EnumFlowMethodFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowRunUpdateManyWithoutFlowNestedInputObjectSchema } from './FlowRunUpdateManyWithoutFlowNestedInput.schema';
import { FlowEventUpdateManyWithoutFlowNestedInputObjectSchema } from './FlowEventUpdateManyWithoutFlowNestedInput.schema';
import { InstanceUpdateOneRequiredWithoutFlowsNestedInputObjectSchema } from './InstanceUpdateOneRequiredWithoutFlowsNestedInput.schema';
import { NodeUpdateManyWithoutFlowNestedInputObjectSchema } from './NodeUpdateManyWithoutFlowNestedInput.schema';
import { SecretUpdateManyWithoutFlowNestedInputObjectSchema } from './SecretUpdateManyWithoutFlowNestedInput.schema';
import { TagUpdateManyWithoutFlowNestedInputObjectSchema } from './TagUpdateManyWithoutFlowNestedInput.schema';
import { TestCaseUpdateManyWithoutFlowNestedInputObjectSchema } from './TestCaseUpdateManyWithoutFlowNestedInput.schema';
import { AuditLogUpdateManyWithoutFlowNestedInputObjectSchema } from './AuditLogUpdateManyWithoutFlowNestedInput.schema';
import { FlowStatisticsUpdateOneWithoutFlowNestedInputObjectSchema } from './FlowStatisticsUpdateOneWithoutFlowNestedInput.schema';

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
    flowRuns: z
      .lazy(() => FlowRunUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    flowEvents: z
      .lazy(() => FlowEventUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    instance: z
      .lazy(() => InstanceUpdateOneRequiredWithoutFlowsNestedInputObjectSchema)
      .optional(),
    nodes: z
      .lazy(() => NodeUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    testCases: z
      .lazy(() => TestCaseUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogUpdateManyWithoutFlowNestedInputObjectSchema)
      .optional(),
    statistics: z
      .lazy(() => FlowStatisticsUpdateOneWithoutFlowNestedInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowUpdateWithoutEdgesInputObjectSchema = Schema;
