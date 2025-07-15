import { z } from 'zod';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { FlowListRelationFilterObjectSchema } from './FlowListRelationFilter.schema';
import { TagListRelationFilterObjectSchema } from './TagListRelationFilter.schema';
import { TagGroupListRelationFilterObjectSchema } from './TagGroupListRelationFilter.schema';
import { UserNullableScalarRelationFilterObjectSchema } from './UserNullableScalarRelationFilter.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.InstanceWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => InstanceWhereInputObjectSchema),
        z.lazy(() => InstanceWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => InstanceWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => InstanceWhereInputObjectSchema),
        z.lazy(() => InstanceWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    description: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    image: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    logo: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    name: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    flows: z.lazy(() => FlowListRelationFilterObjectSchema).optional(),
    tags: z.lazy(() => TagListRelationFilterObjectSchema).optional(),
    tagGroups: z.lazy(() => TagGroupListRelationFilterObjectSchema).optional(),
    user: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterObjectSchema),
        z.lazy(() => UserWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export const InstanceWhereInputObjectSchema = Schema;
