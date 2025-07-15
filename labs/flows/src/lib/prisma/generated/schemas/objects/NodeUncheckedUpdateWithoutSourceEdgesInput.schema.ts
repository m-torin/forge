import { z } from 'zod';
import { NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { EnumNodeTypeFieldUpdateOperationsInputObjectSchema } from './EnumNodeTypeFieldUpdateOperationsInput.schema';
import { BoolFieldUpdateOperationsInputObjectSchema } from './BoolFieldUpdateOperationsInput.schema';
import { SecretUncheckedUpdateManyWithoutNodeNestedInputObjectSchema } from './SecretUncheckedUpdateManyWithoutNodeNestedInput.schema';
import { EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputObjectSchema } from './EdgeUncheckedUpdateManyWithoutTargetNodeNestedInput.schema';
import { TagUncheckedUpdateManyWithoutNodeNestedInputObjectSchema } from './TagUncheckedUpdateManyWithoutNodeNestedInput.schema';

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
    arn: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    createdAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    flowId: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    id: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    infrastructureId: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    name: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    position: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    rfId: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    type: z
      .union([
        NodeTypeSchema,
        z.lazy(() => EnumNodeTypeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    updatedAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    deleted: z
      .union([
        z.boolean(),
        z.lazy(() => BoolFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    secrets: z
      .lazy(() => SecretUncheckedUpdateManyWithoutNodeNestedInputObjectSchema)
      .optional(),
    targetEdges: z
      .lazy(
        () => EdgeUncheckedUpdateManyWithoutTargetNodeNestedInputObjectSchema,
      )
      .optional(),
    Tag: z
      .lazy(() => TagUncheckedUpdateManyWithoutNodeNestedInputObjectSchema)
      .optional(),
  })
  .strict();

export const NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema = Schema;
