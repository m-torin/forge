import { z } from 'zod';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EnumNodeTypeFilterObjectSchema } from './EnumNodeTypeFilter.schema';
import { NodeTypeSchema } from '../enums/NodeType.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.NodeScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => NodeScalarWhereInputObjectSchema),
        z.lazy(() => NodeScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => NodeScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => NodeScalarWhereInputObjectSchema),
        z.lazy(() => NodeScalarWhereInputObjectSchema).array(),
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
  })
  .strict();

export const NodeScalarWhereInputObjectSchema = Schema;
