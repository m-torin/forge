import { z } from 'zod';
import { TagGroupIdInstanceIdCompoundUniqueInputObjectSchema } from './TagGroupIdInstanceIdCompoundUniqueInput.schema';
import { TagGroupWhereInputObjectSchema } from './TagGroupWhereInput.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { TagListRelationFilterObjectSchema } from './TagListRelationFilter.schema';
import { InstanceScalarRelationFilterObjectSchema } from './InstanceScalarRelationFilter.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TagGroupWhereUniqueInput> = z
  .object({
    id: z.string(),
    id_instanceId: z.lazy(
      () => TagGroupIdInstanceIdCompoundUniqueInputObjectSchema,
    ),
    AND: z
      .union([
        z.lazy(() => TagGroupWhereInputObjectSchema),
        z.lazy(() => TagGroupWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => TagGroupWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => TagGroupWhereInputObjectSchema),
        z.lazy(() => TagGroupWhereInputObjectSchema).array(),
      ])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    color: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    instanceId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    tags: z.lazy(() => TagListRelationFilterObjectSchema).optional(),
    instance: z
      .union([
        z.lazy(() => InstanceScalarRelationFilterObjectSchema),
        z.lazy(() => InstanceWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TagGroupWhereUniqueInputObjectSchema = Schema;
