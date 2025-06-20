import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationWhereInputSchema } from '../inputTypeSchemas/VerificationWhereInputSchema'
import { VerificationOrderByWithRelationInputSchema } from '../inputTypeSchemas/VerificationOrderByWithRelationInputSchema'
import { VerificationWhereUniqueInputSchema } from '../inputTypeSchemas/VerificationWhereUniqueInputSchema'
import { VerificationScalarFieldEnumSchema } from '../inputTypeSchemas/VerificationScalarFieldEnumSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const VerificationSelectSchema: z.ZodType<Prisma.VerificationSelect> = z.object({
  id: z.boolean().optional(),
  identifier: z.boolean().optional(),
  value: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
}).strict()

export const VerificationFindFirstArgsSchema: z.ZodType<Prisma.VerificationFindFirstArgs> = z.object({
  select: VerificationSelectSchema.optional(),
  where: VerificationWhereInputSchema.optional(),
  orderBy: z.union([ VerificationOrderByWithRelationInputSchema.array(),VerificationOrderByWithRelationInputSchema ]).optional(),
  cursor: VerificationWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ VerificationScalarFieldEnumSchema,VerificationScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default VerificationFindFirstArgsSchema;
