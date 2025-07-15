import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowUncheckedCreateNestedManyWithoutInstanceInputObjectSchema } from './FlowUncheckedCreateNestedManyWithoutInstanceInput.schema';
import { TagUncheckedCreateNestedManyWithoutInstanceInputObjectSchema } from './TagUncheckedCreateNestedManyWithoutInstanceInput.schema';

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
    userId: z.string().optional().nullable(),
    flows: z
      .lazy(() => FlowUncheckedCreateNestedManyWithoutInstanceInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagUncheckedCreateNestedManyWithoutInstanceInputObjectSchema)
      .optional(),
  })
  .strict();

export const InstanceUncheckedCreateWithoutTagGroupsInputObjectSchema = Schema;
