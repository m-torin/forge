import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { FlowCreateNestedOneWithoutNodesInputObjectSchema } from './FlowCreateNestedOneWithoutNodesInput.schema';
import { InfrastructureCreateNestedOneWithoutNodesInputObjectSchema } from './InfrastructureCreateNestedOneWithoutNodesInput.schema';
import { SecretCreateNestedManyWithoutNodeInputObjectSchema } from './SecretCreateNestedManyWithoutNodeInput.schema';
import { EdgeCreateNestedManyWithoutTargetNodeInputObjectSchema } from './EdgeCreateNestedManyWithoutTargetNodeInput.schema';
import { TagCreateNestedManyWithoutNodeInputObjectSchema } from './TagCreateNestedManyWithoutNodeInput.schema';

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
    id: z.string().optional(),
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
    flow: z.lazy(() => FlowCreateNestedOneWithoutNodesInputObjectSchema),
    infrastructure: z
      .lazy(() => InfrastructureCreateNestedOneWithoutNodesInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretCreateNestedManyWithoutNodeInputObjectSchema)
      .optional(),
    targetEdges: z
      .lazy(() => EdgeCreateNestedManyWithoutTargetNodeInputObjectSchema)
      .optional(),
    Tag: z
      .lazy(() => TagCreateNestedManyWithoutNodeInputObjectSchema)
      .optional(),
  })
  .strict();

export const NodeCreateWithoutSourceEdgesInputObjectSchema = Schema;
