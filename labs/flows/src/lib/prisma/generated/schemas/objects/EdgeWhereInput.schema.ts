import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { EnumEdgeTypeFilterObjectSchema } from './EnumEdgeTypeFilter.schema';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { NodeScalarRelationFilterObjectSchema } from './NodeScalarRelationFilter.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.EdgeWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => EdgeWhereInputObjectSchema),
        z.lazy(() => EdgeWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => EdgeWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => EdgeWhereInputObjectSchema),
        z.lazy(() => EdgeWhereInputObjectSchema).array(),
      ])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    sourceNodeId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    targetNodeId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    rfId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    label: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    isActive: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    type: z
      .union([z.lazy(() => EnumEdgeTypeFilterObjectSchema), EdgeTypeSchema])
      .optional(),
    normalizedKey: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
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
    sourceNode: z
      .union([
        z.lazy(() => NodeScalarRelationFilterObjectSchema),
        z.lazy(() => NodeWhereInputObjectSchema),
      ])
      .optional(),
    targetNode: z
      .union([
        z.lazy(() => NodeScalarRelationFilterObjectSchema),
        z.lazy(() => NodeWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const EdgeWhereInputObjectSchema = Schema;
