import { z } from 'zod';
import { VerificationTokenIdentifierTokenCompoundUniqueInputObjectSchema } from './VerificationTokenIdentifierTokenCompoundUniqueInput.schema';
import { VerificationTokenWhereInputObjectSchema } from './VerificationTokenWhereInput.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.VerificationTokenWhereUniqueInput> = z
  .object({
    token: z.string(),
    identifier_token: z.lazy(
      () => VerificationTokenIdentifierTokenCompoundUniqueInputObjectSchema,
    ),
    AND: z
      .union([
        z.lazy(() => VerificationTokenWhereInputObjectSchema),
        z.lazy(() => VerificationTokenWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => VerificationTokenWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => VerificationTokenWhereInputObjectSchema),
        z.lazy(() => VerificationTokenWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    expires: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    identifier: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
  })
  .strict();

export const VerificationTokenWhereUniqueInputObjectSchema = Schema;
