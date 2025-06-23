import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeCodeHashUserIdCompoundUniqueInputSchema } from './BackupCodeCodeHashUserIdCompoundUniqueInputSchema';
import { BackupCodeWhereInputSchema } from './BackupCodeWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { TwoFactorScalarRelationFilterSchema } from './TwoFactorScalarRelationFilterSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const BackupCodeWhereUniqueInputSchema: z.ZodType<Prisma.BackupCodeWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      codeHash_userId: z.lazy(() => BackupCodeCodeHashUserIdCompoundUniqueInputSchema),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      codeHash_userId: z.lazy(() => BackupCodeCodeHashUserIdCompoundUniqueInputSchema),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().optional(),
        codeHash_userId: z.lazy(() => BackupCodeCodeHashUserIdCompoundUniqueInputSchema).optional(),
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
      .strict(),
  );

export default BackupCodeWhereUniqueInputSchema;
