import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutTwoFactorInputSchema } from './UserCreateNestedOneWithoutTwoFactorInputSchema';

export const TwoFactorCreateWithoutBackupCodesInputSchema: z.ZodType<Prisma.TwoFactorCreateWithoutBackupCodesInput> = z.object({
  id: z.string(),
  secret: z.string(),
  secretHash: z.string().optional().nullable(),
  enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  user: z.lazy(() => UserCreateNestedOneWithoutTwoFactorInputSchema)
}).strict();

export default TwoFactorCreateWithoutBackupCodesInputSchema;
