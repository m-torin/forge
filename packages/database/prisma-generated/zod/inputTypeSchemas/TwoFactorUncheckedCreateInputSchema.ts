import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeUncheckedCreateNestedManyWithoutTwoFactorInputSchema } from './BackupCodeUncheckedCreateNestedManyWithoutTwoFactorInputSchema';

export const TwoFactorUncheckedCreateInputSchema: z.ZodType<Prisma.TwoFactorUncheckedCreateInput> =
  z
    .object({
      id: z.string(),
      userId: z.string(),
      secret: z.string(),
      secretHash: z.string().optional().nullable(),
      enabled: z.boolean().optional(),
      verified: z.boolean().optional(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      backupCodes: z
        .lazy(() => BackupCodeUncheckedCreateNestedManyWithoutTwoFactorInputSchema)
        .optional(),
    })
    .strict();

export default TwoFactorUncheckedCreateInputSchema;
