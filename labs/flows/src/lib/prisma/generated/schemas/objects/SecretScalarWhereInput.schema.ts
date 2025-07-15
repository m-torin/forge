import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { EnumSecretCategoryFilterObjectSchema } from './EnumSecretCategoryFilter.schema';
import { SecretCategorySchema } from '../enums/SecretCategory.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.SecretScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => SecretScalarWhereInputObjectSchema),
        z.lazy(() => SecretScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => SecretScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => SecretScalarWhereInputObjectSchema),
        z.lazy(() => SecretScalarWhereInputObjectSchema).array(),
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
    id: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
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
  })
  .strict();

export const SecretScalarWhereInputObjectSchema = Schema;
