import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowUpdateManyWithoutInstanceNestedInputObjectSchema } from './FlowUpdateManyWithoutInstanceNestedInput.schema';
import { TagUpdateManyWithoutInstanceNestedInputObjectSchema } from './TagUpdateManyWithoutInstanceNestedInput.schema';
import { TagGroupUpdateManyWithoutInstanceNestedInputObjectSchema } from './TagGroupUpdateManyWithoutInstanceNestedInput.schema';
import { UserUpdateOneWithoutInstancesNestedInputObjectSchema } from './UserUpdateOneWithoutInstancesNestedInput.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<Prisma.InstanceUpdateInput> = z
  .object({
    createdAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    description: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    id: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    image: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    logo: z
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
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z
      .union([
        z.coerce.date(),
        z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    flows: z
      .lazy(() => FlowUpdateManyWithoutInstanceNestedInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagUpdateManyWithoutInstanceNestedInputObjectSchema)
      .optional(),
    tagGroups: z
      .lazy(() => TagGroupUpdateManyWithoutInstanceNestedInputObjectSchema)
      .optional(),
    user: z
      .lazy(() => UserUpdateOneWithoutInstancesNestedInputObjectSchema)
      .optional(),
  })
  .strict();

export const InstanceUpdateInputObjectSchema = Schema;
