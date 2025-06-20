import { z } from 'zod';
import type { Prisma } from '../../client';
import { BackupCodeIncludeSchema } from '../inputTypeSchemas/BackupCodeIncludeSchema'
import { BackupCodeWhereInputSchema } from '../inputTypeSchemas/BackupCodeWhereInputSchema'
import { BackupCodeOrderByWithRelationInputSchema } from '../inputTypeSchemas/BackupCodeOrderByWithRelationInputSchema'
import { BackupCodeWhereUniqueInputSchema } from '../inputTypeSchemas/BackupCodeWhereUniqueInputSchema'
import { BackupCodeScalarFieldEnumSchema } from '../inputTypeSchemas/BackupCodeScalarFieldEnumSchema'
import { TwoFactorArgsSchema } from "../outputTypeSchemas/TwoFactorArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const BackupCodeFindManyArgsSchema: z.ZodType<Prisma.BackupCodeFindManyArgs> = z.object({
  select: BackupCodeSelectSchema.optional(),
  include: z.lazy(() => BackupCodeIncludeSchema).optional(),
  where: BackupCodeWhereInputSchema.optional(),
  orderBy: z.union([ BackupCodeOrderByWithRelationInputSchema.array(),BackupCodeOrderByWithRelationInputSchema ]).optional(),
  cursor: BackupCodeWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BackupCodeScalarFieldEnumSchema,BackupCodeScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default BackupCodeFindManyArgsSchema;
