import { z } from 'zod';
import { AuditLogWhereInputObjectSchema } from './objects/AuditLogWhereInput.schema';

export const AuditLogDeleteManySchema = z.object({
  where: AuditLogWhereInputObjectSchema.optional(),
});
