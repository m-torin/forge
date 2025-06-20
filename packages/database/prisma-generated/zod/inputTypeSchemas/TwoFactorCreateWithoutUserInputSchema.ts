import type { Prisma } from '../../client';

import { z } from 'zod';
import { BackupCodeCreateNestedManyWithoutTwoFactorInputSchema } from './BackupCodeCreateNestedManyWithoutTwoFactorInputSchema';

export const TwoFactorCreateWithoutUserInputSchema: z.ZodType<Prisma.TwoFactorCreateWithoutUserInput> = z.object({
  id: z.string(),
  secret: z.string(),
  secretHash: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  backupCodes: z.lazy(() => BackupCodeCreateNestedManyWithoutTwoFactorInputSchema).optional()
}).strict();

export default TwoFactorCreateWithoutUserInputSchema;
