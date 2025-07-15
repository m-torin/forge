import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';

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
    id: z.string().optional(),
    instanceId: z.string(),
    isEnabled: z.boolean().optional(),
    method: FlowMethodSchema.optional(),
    name: z.string(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    viewport: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    deleted: z.boolean().optional(),
  })
  .strict();

export const FlowCreateManyInputObjectSchema = Schema;
