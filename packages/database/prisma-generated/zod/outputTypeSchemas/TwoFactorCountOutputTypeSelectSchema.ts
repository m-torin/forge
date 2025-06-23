import { z } from 'zod';
import type { Prisma } from '../../client';

export const TwoFactorCountOutputTypeSelectSchema: z.ZodType<Prisma.TwoFactorCountOutputTypeSelect> =
  z
    .object({
      backupCodes: z.boolean().optional(),
    })
    .strict();

export default TwoFactorCountOutputTypeSelectSchema;
