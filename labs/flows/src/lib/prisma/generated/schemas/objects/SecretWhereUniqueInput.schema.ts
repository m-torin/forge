import { z } from 'zod';
import { SecretWhereInputObjectSchema } from './SecretWhereInput.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { EnumSecretCategoryFilterObjectSchema } from './EnumSecretCategoryFilter.schema';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { FlowNullableScalarRelationFilterObjectSchema } from './FlowNullableScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { NodeNullableScalarRelationFilterObjectSchema } from './NodeNullableScalarRelationFilter.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.SecretWhereUniqueInput> = z
  .object({
    id: z.number().int(),
    AND: z
      .union([
        z.lazy(() => SecretWhereInputObjectSchema),
        z.lazy(() => SecretWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => SecretWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => SecretWhereInputObjectSchema),
        z.lazy(() => SecretWhereInputObjectSchema).array(),
      ])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    category: z
      .union([
        z.lazy(() => EnumSecretCategoryFilterObjectSchema),
        SecretCategorySchema,
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    nodeId: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    secret: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    shouldEncrypt: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
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
  })
  .strict();

export const SecretWhereUniqueInputObjectSchema = Schema;
