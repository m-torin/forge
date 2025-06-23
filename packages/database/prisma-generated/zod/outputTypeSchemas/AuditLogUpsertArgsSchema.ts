import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogWhereUniqueInputSchema } from '../inputTypeSchemas/AuditLogWhereUniqueInputSchema';
import { AuditLogCreateInputSchema } from '../inputTypeSchemas/AuditLogCreateInputSchema';
import { AuditLogUncheckedCreateInputSchema } from '../inputTypeSchemas/AuditLogUncheckedCreateInputSchema';
import { AuditLogUpdateInputSchema } from '../inputTypeSchemas/AuditLogUpdateInputSchema';
import { AuditLogUncheckedUpdateInputSchema } from '../inputTypeSchemas/AuditLogUncheckedUpdateInputSchema';
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

export const AuditLogUpsertArgsSchema: z.ZodType<Prisma.AuditLogUpsertArgs> = z
  .object({
    select: AuditLogSelectSchema.optional(),
    where: AuditLogWhereUniqueInputSchema,
    create: z.union([AuditLogCreateInputSchema, AuditLogUncheckedCreateInputSchema]),
    update: z.union([AuditLogUpdateInputSchema, AuditLogUncheckedUpdateInputSchema]),
  })
  .strict();

export default AuditLogUpsertArgsSchema;
