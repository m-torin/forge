import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { TwoFactorScalarRelationFilterSchema } from './TwoFactorScalarRelationFilterSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const BackupCodeWhereInputSchema: z.ZodType<Prisma.BackupCodeWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => BackupCodeWhereInputSchema),
        z.lazy(() => BackupCodeWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => BackupCodeWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => BackupCodeWhereInputSchema),
        z.lazy(() => BackupCodeWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    code: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    codeHash: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    twoFactorId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    used: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    usedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    twoFactor: z
      .union([
        z.lazy(() => TwoFactorScalarRelationFilterSchema),
        z.lazy(() => TwoFactorWhereInputSchema),
      ])
      .optional(),
  })
  .strict();

export default BackupCodeWhereInputSchema;
