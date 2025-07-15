import { z } from 'zod';
import { MantineColorSchema } from '../enums/MantineColor.schema';
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

const Schema: z.ZodType<Prisma.TestCaseUncheckedCreateInput> = z
  .object({
    color: MantineColorSchema,
    createdAt: z.coerce.date().optional(),
    flowId: z.string(),
    id: z.string().optional(),
    name: z.string().optional().nullable(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
  })
  .strict();

export const TestCaseUncheckedCreateInputObjectSchema = Schema;
