import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { EdgeUncheckedCreateNestedManyWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedCreateNestedManyWithoutSourceNodeInput.schema';
import { EdgeUncheckedCreateNestedManyWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedCreateNestedManyWithoutTargetNodeInput.schema';
import { TagUncheckedCreateNestedManyWithoutNodeInputObjectSchema } from './TagUncheckedCreateNestedManyWithoutNodeInput.schema';

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
    createdAt: z.coerce.date().optional(),
    flowId: z.string(),
    id: z.string().optional(),
    infrastructureId: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    position: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    rfId: z.string(),
    type: NodeTypeSchema,
    updatedAt: z.coerce.date().optional(),
    deleted: z.boolean().optional(),
    sourceEdges: z
      .lazy(
        () => EdgeUncheckedCreateNestedManyWithoutSourceNodeInputObjectSchema,
      )
      .optional(),
    targetEdges: z
      .lazy(
        () => EdgeUncheckedCreateNestedManyWithoutTargetNodeInputObjectSchema,
      )
      .optional(),
    Tag: z
      .lazy(() => TagUncheckedCreateNestedManyWithoutNodeInputObjectSchema)
      .optional(),
  })
  .strict();

export const NodeUncheckedCreateWithoutSecretsInputObjectSchema = Schema;
