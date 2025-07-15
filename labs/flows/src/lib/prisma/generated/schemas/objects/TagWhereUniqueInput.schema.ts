import { z } from 'zod';
import { TagIdInstanceIdCompoundUniqueInputObjectSchema } from './TagIdInstanceIdCompoundUniqueInput.schema';
import { TagWhereInputObjectSchema } from './TagWhereInput.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { FlowNullableScalarRelationFilterObjectSchema } from './FlowNullableScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { NodeNullableScalarRelationFilterObjectSchema } from './NodeNullableScalarRelationFilter.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { TagGroupNullableScalarRelationFilterObjectSchema } from './TagGroupNullableScalarRelationFilter.schema';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';
import { InstanceScalarRelationFilterObjectSchema } from './InstanceScalarRelationFilter.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TagWhereUniqueInput> = z
  .object({
    id: z.number().int(),
    id_instanceId: z.lazy(() => TagIdInstanceIdCompoundUniqueInputObjectSchema),
    AND: z
      .union([
        z.lazy(() => TagWhereInputObjectSchema),
        z.lazy(() => TagWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => TagWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => TagWhereInputObjectSchema),
        z.lazy(() => TagWhereInputObjectSchema).array(),
      ])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    flowId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    nodeId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    tagGroupId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    instanceId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowNullableScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
    node: z
      .union([
        z.lazy(() => NodeNullableScalarRelationFilterObjectSchema),
        z.lazy(() => NodeWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
    tagGroup: z
      .union([
        z.lazy(() => TagGroupNullableScalarRelationFilterObjectSchema),
        z.lazy(() => TagGroupWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
    instance: z
      .union([
        z.lazy(() => InstanceScalarRelationFilterObjectSchema),
        z.lazy(() => InstanceWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TagWhereUniqueInputObjectSchema = Schema;
