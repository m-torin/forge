import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const PasskeyScalarWhereInputSchema: z.ZodType<Prisma.PasskeyScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => PasskeyScalarWhereInputSchema),
        z.lazy(() => PasskeyScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => PasskeyScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => PasskeyScalarWhereInputSchema),
        z.lazy(() => PasskeyScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    credentialId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    publicKey: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    counter: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    deviceType: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    backedUp: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    transports: z.lazy(() => StringNullableListFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    lastUsedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  })
  .strict();

export default PasskeyScalarWhereInputSchema;
