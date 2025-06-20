import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogWhereInputSchema } from '../inputTypeSchemas/AuditLogWhereInputSchema'
import { AuditLogOrderByWithRelationInputSchema } from '../inputTypeSchemas/AuditLogOrderByWithRelationInputSchema'
import { AuditLogWhereUniqueInputSchema } from '../inputTypeSchemas/AuditLogWhereUniqueInputSchema'
import { AuditLogScalarFieldEnumSchema } from '../inputTypeSchemas/AuditLogScalarFieldEnumSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const AuditLogSelectSchema: z.ZodType<Prisma.AuditLogSelect> = z.object({
  id: z.boolean().optional(),
  type: z.boolean().optional(),
  action: z.boolean().optional(),
  userId: z.boolean().optional(),
  email: z.boolean().optional(),
  ipAddress: z.boolean().optional(),
  userAgent: z.boolean().optional(),
  metadata: z.boolean().optional(),
  success: z.boolean().optional(),
  errorMessage: z.boolean().optional(),
  timestamp: z.boolean().optional(),
}).strict()

export const AuditLogFindManyArgsSchema: z.ZodType<Prisma.AuditLogFindManyArgs> = z.object({
  select: AuditLogSelectSchema.optional(),
  where: AuditLogWhereInputSchema.optional(),
  orderBy: z.union([ AuditLogOrderByWithRelationInputSchema.array(),AuditLogOrderByWithRelationInputSchema ]).optional(),
  cursor: AuditLogWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AuditLogScalarFieldEnumSchema,AuditLogScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default AuditLogFindManyArgsSchema;
