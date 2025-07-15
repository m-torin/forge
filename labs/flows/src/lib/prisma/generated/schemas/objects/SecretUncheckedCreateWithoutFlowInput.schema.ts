import { z } from 'zod';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';
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
    name: z.string(),
    category: SecretCategorySchema,
    createdAt: z.coerce.date().optional(),
    id: z.number().int().optional(),
    nodeId: z.string().optional().nullable(),
    secret: z.string(),
    shouldEncrypt: z.boolean().optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
  })
  .strict();

export const SecretUncheckedCreateWithoutFlowInputObjectSchema = Schema;
