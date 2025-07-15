import { z } from 'zod';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { IntNullableFilterObjectSchema } from './IntNullableFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AccountScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => AccountScalarWhereInputObjectSchema),
        z.lazy(() => AccountScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => AccountScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => AccountScalarWhereInputObjectSchema),
        z.lazy(() => AccountScalarWhereInputObjectSchema).array(),
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
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
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
  })
  .strict();

export const AccountScalarWhereInputObjectSchema = Schema;
