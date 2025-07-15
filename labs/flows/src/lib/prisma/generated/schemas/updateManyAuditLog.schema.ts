import { z } from 'zod';
import { AuditLogUpdateManyMutationInputObjectSchema } from './objects/AuditLogUpdateManyMutationInput.schema';
import { AuditLogWhereInputObjectSchema } from './objects/AuditLogWhereInput.schema';

export const AuditLogUpdateManySchema = z.object({
  data: AuditLogUpdateManyMutationInputObjectSchema,
  where: AuditLogWhereInputObjectSchema.optional(),
});
