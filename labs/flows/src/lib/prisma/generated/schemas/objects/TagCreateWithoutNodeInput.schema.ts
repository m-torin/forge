import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowCreateNestedOneWithoutTagsInputObjectSchema } from './FlowCreateNestedOneWithoutTagsInput.schema';
import { TagGroupCreateNestedOneWithoutTagsInputObjectSchema } from './TagGroupCreateNestedOneWithoutTagsInput.schema';
import { InstanceCreateNestedOneWithoutTagsInputObjectSchema } from './InstanceCreateNestedOneWithoutTagsInput.schema';

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
    name: z.string(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    flow: z
      .lazy(() => FlowCreateNestedOneWithoutTagsInputObjectSchema)
      .optional(),
    tagGroup: z
      .lazy(() => TagGroupCreateNestedOneWithoutTagsInputObjectSchema)
      .optional(),
    instance: z.lazy(() => InstanceCreateNestedOneWithoutTagsInputObjectSchema),
  })
  .strict();

export const TagCreateWithoutNodeInputObjectSchema = Schema;
