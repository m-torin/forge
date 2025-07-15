import { z } from 'zod';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowCreateNestedOneWithoutEdgesInputObjectSchema } from './FlowCreateNestedOneWithoutEdgesInput.schema';
import { NodeCreateNestedOneWithoutTargetEdgesInputObjectSchema } from './NodeCreateNestedOneWithoutTargetEdgesInput.schema';

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
    rfId: z.string().optional().nullable(),
    label: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    type: EdgeTypeSchema.optional(),
    normalizedKey: z.string().optional().nullable(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
    flow: z.lazy(() => FlowCreateNestedOneWithoutEdgesInputObjectSchema),
    targetNode: z.lazy(
      () => NodeCreateNestedOneWithoutTargetEdgesInputObjectSchema,
    ),
  })
  .strict();

export const EdgeCreateWithoutSourceNodeInputObjectSchema = Schema;
