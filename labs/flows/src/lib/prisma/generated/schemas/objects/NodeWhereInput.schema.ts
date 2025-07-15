import { z } from 'zod';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EnumNodeTypeFilterObjectSchema } from './EnumNodeTypeFilter.schema';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { InfrastructureNullableScalarRelationFilterObjectSchema } from './InfrastructureNullableScalarRelationFilter.schema';
import { InfrastructureWhereInputObjectSchema } from './InfrastructureWhereInput.schema';
import { SecretListRelationFilterObjectSchema } from './SecretListRelationFilter.schema';
import { EdgeListRelationFilterObjectSchema } from './EdgeListRelationFilter.schema';
import { TagListRelationFilterObjectSchema } from './TagListRelationFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.NodeWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => NodeWhereInputObjectSchema),
        z.lazy(() => NodeWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => NodeWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => NodeWhereInputObjectSchema),
        z.lazy(() => NodeWhereInputObjectSchema).array(),
      ])
      .optional(),
    arn: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    infrastructureId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    name: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    position: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    rfId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    type: z
      .union([z.lazy(() => EnumNodeTypeFilterObjectSchema), NodeTypeSchema])
      .optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional(),
    infrastructure: z
      .union([
        z.lazy(() => InfrastructureNullableScalarRelationFilterObjectSchema),
        z.lazy(() => InfrastructureWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
    secrets: z.lazy(() => SecretListRelationFilterObjectSchema).optional(),
    sourceEdges: z.lazy(() => EdgeListRelationFilterObjectSchema).optional(),
    targetEdges: z.lazy(() => EdgeListRelationFilterObjectSchema).optional(),
    Tag: z.lazy(() => TagListRelationFilterObjectSchema).optional(),
  })
  .strict();

export const NodeWhereInputObjectSchema = Schema;
