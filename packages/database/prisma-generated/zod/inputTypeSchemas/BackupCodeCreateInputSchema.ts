import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorCreateNestedOneWithoutBackupCodesInputSchema } from './TwoFactorCreateNestedOneWithoutBackupCodesInputSchema';

export const BackupCodeCreateInputSchema: z.ZodType<Prisma.BackupCodeCreateInput> = z
  .object({
    id: z.string(),
    code: z.string(),
    codeHash: z.string(),
    userId: z.string(),
    used: z.boolean().optional(),
    usedAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date(),
    twoFactor: z.lazy(() => TwoFactorCreateNestedOneWithoutBackupCodesInputSchema),
  })
  .strict();

export default BackupCodeCreateInputSchema;
