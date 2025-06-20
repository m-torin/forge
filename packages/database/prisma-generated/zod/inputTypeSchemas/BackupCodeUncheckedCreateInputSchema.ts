import type { Prisma } from '../../client';

import { z } from 'zod';

export const BackupCodeUncheckedCreateInputSchema: z.ZodType<Prisma.BackupCodeUncheckedCreateInput> = z.object({
  id: z.string(),
  code: z.string(),
  codeHash: z.string(),
  userId: z.string(),
  twoFactorId: z.string(),
  used: z.boolean().optional(),
  usedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date()
}).strict();

export default BackupCodeUncheckedCreateInputSchema;
