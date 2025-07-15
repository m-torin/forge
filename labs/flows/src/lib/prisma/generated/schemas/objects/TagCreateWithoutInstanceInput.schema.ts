import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowCreateNestedOneWithoutTagsInputObjectSchema } from './FlowCreateNestedOneWithoutTagsInput.schema';
import { NodeCreateNestedOneWithoutTagInputObjectSchema } from './NodeCreateNestedOneWithoutTagInput.schema';
import { TagGroupCreateNestedOneWithoutTagsInputObjectSchema } from './TagGroupCreateNestedOneWithoutTagsInput.schema';

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
    node: z
      .lazy(() => NodeCreateNestedOneWithoutTagInputObjectSchema)
      .optional(),
    tagGroup: z
      .lazy(() => TagGroupCreateNestedOneWithoutTagsInputObjectSchema)
      .optional(),
  })
  .strict();

export const TagCreateWithoutInstanceInputObjectSchema = Schema;
