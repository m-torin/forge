import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorArgsSchema } from '../outputTypeSchemas/TwoFactorArgsSchema';

export const BackupCodeIncludeSchema: z.ZodType<Prisma.BackupCodeInclude> = z
  .object({
    twoFactor: z.union([z.boolean(), z.lazy(() => TwoFactorArgsSchema)]).optional(),
  })
  .strict();

export default BackupCodeIncludeSchema;
