import { z } from 'zod';
import { AuditLogSelectObjectSchema } from './objects/AuditLogSelect.schema';
import { AuditLogIncludeObjectSchema } from './objects/AuditLogInclude.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './objects/AuditLogWhereUniqueInput.schema';

export const AuditLogDeleteOneSchema = z.object({
  select: AuditLogSelectObjectSchema.optional(),
  include: AuditLogIncludeObjectSchema.optional(),
  where: AuditLogWhereUniqueInputObjectSchema,
});
