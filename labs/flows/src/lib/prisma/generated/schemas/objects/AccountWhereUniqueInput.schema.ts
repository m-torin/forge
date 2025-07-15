import { z } from 'zod';
import { AccountProviderProviderAccountIdCompoundUniqueInputObjectSchema } from './AccountProviderProviderAccountIdCompoundUniqueInput.schema';
import { AccountWhereInputObjectSchema } from './AccountWhereInput.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { IntNullableFilterObjectSchema } from './IntNullableFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { UserScalarRelationFilterObjectSchema } from './UserScalarRelationFilter.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AccountWhereUniqueInput> = z
  .object({
    id: z.string(),
    provider_providerAccountId: z.lazy(
      () => AccountProviderProviderAccountIdCompoundUniqueInputObjectSchema,
    ),
    AND: z
      .union([
        z.lazy(() => AccountWhereInputObjectSchema),
        z.lazy(() => AccountWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => AccountWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => AccountWhereInputObjectSchema),
        z.lazy(() => AccountWhereInputObjectSchema).array(),
      ])
      .optional(),
    access_token: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    expires_at: z
      .union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()])
      .optional()
      .nullable(),
    id_token: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    oauth_token: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    oauth_token_secret: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    provider: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    providerAccountId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    refresh_token: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    refresh_token_expires_in: z
      .union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()])
      .optional()
      .nullable(),
    scope: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    session_state: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    token_type: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    type: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    userId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    user: z
      .union([
        z.lazy(() => UserScalarRelationFilterObjectSchema),
        z.lazy(() => UserWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const AccountWhereUniqueInputObjectSchema = Schema;
