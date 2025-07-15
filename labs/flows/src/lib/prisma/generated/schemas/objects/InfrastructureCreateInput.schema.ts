import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { InfraTypeSchema } from '../enums/InfraType.schema';
import { NodeCreateNestedManyWithoutInfrastructureInputObjectSchema } from './NodeCreateNestedManyWithoutInfrastructureInput.schema';

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
    arn: z.string().optional().nullable(),
    canControl: z.boolean(),
    createdAt: z.coerce.date().optional(),
    data: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    type: InfraTypeSchema,
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
    nodes: z
      .lazy(() => NodeCreateNestedManyWithoutInfrastructureInputObjectSchema)
      .optional(),
  })
  .strict();

export const InfrastructureCreateInputObjectSchema = Schema;
