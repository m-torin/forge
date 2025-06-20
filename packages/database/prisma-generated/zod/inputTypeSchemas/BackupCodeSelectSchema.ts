import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorArgsSchema } from "../outputTypeSchemas/TwoFactorArgsSchema"

export const BackupCodeSelectSchema: z.ZodType<Prisma.BackupCodeSelect> = z.object({
  id: z.boolean().optional(),
  code: z.boolean().optional(),
  codeHash: z.boolean().optional(),
  userId: z.boolean().optional(),
  twoFactorId: z.boolean().optional(),
  used: z.boolean().optional(),
  usedAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  twoFactor: z.union([z.boolean(),z.lazy(() => TwoFactorArgsSchema)]).optional(),
}).strict()

export default BackupCodeSelectSchema;
