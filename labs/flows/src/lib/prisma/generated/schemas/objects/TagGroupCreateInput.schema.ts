import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { TagCreateNestedManyWithoutTagGroupInputObjectSchema } from './TagCreateNestedManyWithoutTagGroupInput.schema';
import { InstanceCreateNestedOneWithoutTagGroupsInputObjectSchema } from './InstanceCreateNestedOneWithoutTagGroupsInput.schema';

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
    id: z.string().optional(),
    name: z.string(),
    color: z.string(),
    deleted: z.boolean().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    tags: z
      .lazy(() => TagCreateNestedManyWithoutTagGroupInputObjectSchema)
      .optional(),
    instance: z.lazy(
      () => InstanceCreateNestedOneWithoutTagGroupsInputObjectSchema,
    ),
  })
  .strict();

export const TagGroupCreateInputObjectSchema = Schema;
