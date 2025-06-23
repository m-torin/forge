import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogUpdateInputSchema } from '../inputTypeSchemas/AuditLogUpdateInputSchema';
import { AuditLogUncheckedUpdateInputSchema } from '../inputTypeSchemas/AuditLogUncheckedUpdateInputSchema';
import { AuditLogWhereUniqueInputSchema } from '../inputTypeSchemas/AuditLogWhereUniqueInputSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const AuditLogSelectSchema: z.ZodType<Prisma.AuditLogSelect> = z
  .object({
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
  })
  .strict();

export const AuditLogUpdateArgsSchema: z.ZodType<Prisma.AuditLogUpdateArgs> = z
  .object({
    select: AuditLogSelectSchema.optional(),
    data: z.union([AuditLogUpdateInputSchema, AuditLogUncheckedUpdateInputSchema]),
    where: AuditLogWhereUniqueInputSchema,
  })
  .strict();

export default AuditLogUpdateArgsSchema;
