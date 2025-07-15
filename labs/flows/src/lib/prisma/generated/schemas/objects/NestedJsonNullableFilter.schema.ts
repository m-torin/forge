import { z } from 'zod';
import { QueryModeSchema } from '../enums/QueryMode.schema';

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
    equals: jsonSchema.optional(),
    path: z.string().array().optional(),
    mode: QueryModeSchema.optional(),
    string_contains: z.string().optional(),
    string_starts_with: z.string().optional(),
    string_ends_with: z.string().optional(),
    array_starts_with: jsonSchema.optional().nullable(),
    array_ends_with: jsonSchema.optional().nullable(),
    array_contains: jsonSchema.optional().nullable(),
    lt: jsonSchema.optional(),
    lte: jsonSchema.optional(),
    gt: jsonSchema.optional(),
    gte: jsonSchema.optional(),
    not: jsonSchema.optional(),
  })
  .strict();

export const NestedJsonNullableFilterObjectSchema = Schema;
