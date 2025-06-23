import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeIncludeSchema } from '../inputTypeSchemas/BackupCodeIncludeSchema';
import { BackupCodeUpdateInputSchema } from '../inputTypeSchemas/BackupCodeUpdateInputSchema';
import { BackupCodeUncheckedUpdateInputSchema } from '../inputTypeSchemas/BackupCodeUncheckedUpdateInputSchema';
import { BackupCodeWhereUniqueInputSchema } from '../inputTypeSchemas/BackupCodeWhereUniqueInputSchema';
import { TwoFactorArgsSchema } from '../outputTypeSchemas/TwoFactorArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BackupCodeSelectSchema: z.ZodType<Prisma.BackupCodeSelect> = z
  .object({
    id: z.boolean().optional(),
    code: z.boolean().optional(),
    codeHash: z.boolean().optional(),
    userId: z.boolean().optional(),
    twoFactorId: z.boolean().optional(),
    used: z.boolean().optional(),
    usedAt: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    twoFactor: z.union([z.boolean(), z.lazy(() => TwoFactorArgsSchema)]).optional(),
  })
  .strict();

export const BackupCodeUpdateArgsSchema: z.ZodType<Prisma.BackupCodeUpdateArgs> = z
  .object({
    select: BackupCodeSelectSchema.optional(),
    include: z.lazy(() => BackupCodeIncludeSchema).optional(),
    data: z.union([BackupCodeUpdateInputSchema, BackupCodeUncheckedUpdateInputSchema]),
    where: BackupCodeWhereUniqueInputSchema,
  })
  .strict();

export default BackupCodeUpdateArgsSchema;
