import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorIncludeSchema } from '../inputTypeSchemas/TwoFactorIncludeSchema'
import { TwoFactorWhereUniqueInputSchema } from '../inputTypeSchemas/TwoFactorWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { BackupCodeFindManyArgsSchema } from "../outputTypeSchemas/BackupCodeFindManyArgsSchema"
import { TwoFactorCountOutputTypeArgsSchema } from "../outputTypeSchemas/TwoFactorCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TwoFactorSelectSchema: z.ZodType<Prisma.TwoFactorSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  secret: z.boolean().optional(),
  secretHash: z.boolean().optional(),
  enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  backupCodes: z.union([z.boolean(),z.lazy(() => BackupCodeFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TwoFactorCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TwoFactorFindUniqueArgsSchema: z.ZodType<Prisma.TwoFactorFindUniqueArgs> = z.object({
  select: TwoFactorSelectSchema.optional(),
  include: z.lazy(() => TwoFactorIncludeSchema).optional(),
  where: TwoFactorWhereUniqueInputSchema,
}).strict() ;

export default TwoFactorFindUniqueArgsSchema;
