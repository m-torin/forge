import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { TagCreateNestedManyWithoutInstanceInputObjectSchema } from './TagCreateNestedManyWithoutInstanceInput.schema';
import { TagGroupCreateNestedManyWithoutInstanceInputObjectSchema } from './TagGroupCreateNestedManyWithoutInstanceInput.schema';
import { UserCreateNestedOneWithoutInstancesInputObjectSchema } from './UserCreateNestedOneWithoutInstancesInput.schema';

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
    createdAt: z.coerce.date().optional(),
    description: z.string().optional().nullable(),
    id: z.string().optional(),
    image: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    tags: z
      .lazy(() => TagCreateNestedManyWithoutInstanceInputObjectSchema)
      .optional(),
    tagGroups: z
      .lazy(() => TagGroupCreateNestedManyWithoutInstanceInputObjectSchema)
      .optional(),
    user: z
      .lazy(() => UserCreateNestedOneWithoutInstancesInputObjectSchema)
      .optional(),
  })
  .strict();

export const InstanceCreateWithoutFlowsInputObjectSchema = Schema;
