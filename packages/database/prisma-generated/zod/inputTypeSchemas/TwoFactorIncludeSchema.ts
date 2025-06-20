import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { BackupCodeFindManyArgsSchema } from "../outputTypeSchemas/BackupCodeFindManyArgsSchema"
import { TwoFactorCountOutputTypeArgsSchema } from "../outputTypeSchemas/TwoFactorCountOutputTypeArgsSchema"

export const TwoFactorIncludeSchema: z.ZodType<Prisma.TwoFactorInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  backupCodes: z.union([z.boolean(),z.lazy(() => BackupCodeFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TwoFactorCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default TwoFactorIncludeSchema;
