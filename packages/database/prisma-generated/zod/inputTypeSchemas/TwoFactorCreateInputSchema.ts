import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutTwoFactorInputSchema } from './UserCreateNestedOneWithoutTwoFactorInputSchema';
import { BackupCodeCreateNestedManyWithoutTwoFactorInputSchema } from './BackupCodeCreateNestedManyWithoutTwoFactorInputSchema';

export const TwoFactorCreateInputSchema: z.ZodType<Prisma.TwoFactorCreateInput> = z.object({
  id: z.string(),
  secret: z.string(),
  secretHash: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutTwoFactorInputSchema),
  backupCodes: z.lazy(() => BackupCodeCreateNestedManyWithoutTwoFactorInputSchema).optional()
}).strict();

export default TwoFactorCreateInputSchema;
