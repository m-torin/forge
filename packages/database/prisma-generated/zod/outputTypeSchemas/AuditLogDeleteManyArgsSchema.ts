import { z } from 'zod';
import type { Prisma } from '../../client';
import { AuditLogWhereInputSchema } from '../inputTypeSchemas/AuditLogWhereInputSchema';

export const AuditLogDeleteManyArgsSchema: z.ZodType<Prisma.AuditLogDeleteManyArgs> = z
  .object({
    where: AuditLogWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default AuditLogDeleteManyArgsSchema;
