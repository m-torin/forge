import { z } from 'zod';
import type { Prisma } from '../../client';
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

export const AuditLogDeleteArgsSchema: z.ZodType<Prisma.AuditLogDeleteArgs> = z
  .object({
    select: AuditLogSelectSchema.optional(),
    where: AuditLogWhereUniqueInputSchema,
  })
  .strict();

export default AuditLogDeleteArgsSchema;
