import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { EnumEdgeTypeFilterObjectSchema } from './EnumEdgeTypeFilter.schema';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.EdgeScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => EdgeScalarWhereInputObjectSchema),
        z.lazy(() => EdgeScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => EdgeScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => EdgeScalarWhereInputObjectSchema),
        z.lazy(() => EdgeScalarWhereInputObjectSchema).array(),
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
  })
  .strict();

export const EdgeScalarWhereInputObjectSchema = Schema;
