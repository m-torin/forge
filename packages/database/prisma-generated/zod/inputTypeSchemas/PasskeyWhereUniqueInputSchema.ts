import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyWhereInputSchema } from './PasskeyWhereInputSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const PasskeyWhereUniqueInputSchema: z.ZodType<Prisma.PasskeyWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      credentialId: z.string(),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      credentialId: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().optional(),
        credentialId: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => PasskeyWhereInputSchema),
            z.lazy(() => PasskeyWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => PasskeyWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => PasskeyWhereInputSchema),
            z.lazy(() => PasskeyWhereInputSchema).array(),
          ])
          .optional(),
        name: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        publicKey: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        counter: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        deviceType: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        backedUp: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        transports: z.lazy(() => StringNullableListFilterSchema).optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        lastUsedAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        user: z
          .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
          .optional(),
      })
      .strict(),
  );

export default PasskeyWhereUniqueInputSchema;
