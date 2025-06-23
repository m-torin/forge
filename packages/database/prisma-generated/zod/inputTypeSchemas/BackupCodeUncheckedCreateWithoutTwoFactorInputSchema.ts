import type { Prisma } from '../../client';

import { z } from 'zod';

export const BackupCodeUncheckedCreateWithoutTwoFactorInputSchema: z.ZodType<Prisma.BackupCodeUncheckedCreateWithoutTwoFactorInput> =
  z
    .object({
      id: z.string(),
      code: z.string(),
      codeHash: z.string(),
      userId: z.string(),
      used: z.boolean().optional(),
      usedAt: z.coerce.date().optional().nullable(),
      createdAt: z.coerce.date(),
    })
    .strict();

export default BackupCodeUncheckedCreateWithoutTwoFactorInputSchema;
