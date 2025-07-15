import { z } from 'zod';
import { AuditLogSelectObjectSchema } from './objects/AuditLogSelect.schema';
import { AuditLogIncludeObjectSchema } from './objects/AuditLogInclude.schema';
import { AuditLogUpdateInputObjectSchema } from './objects/AuditLogUpdateInput.schema';
import { AuditLogUncheckedUpdateInputObjectSchema } from './objects/AuditLogUncheckedUpdateInput.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './objects/AuditLogWhereUniqueInput.schema';

export const AuditLogUpdateOneSchema = z.object({
  select: AuditLogSelectObjectSchema.optional(),
  include: AuditLogIncludeObjectSchema.optional(),
  data: z.union([
    AuditLogUpdateInputObjectSchema,
    AuditLogUncheckedUpdateInputObjectSchema,
  ]),
  where: AuditLogWhereUniqueInputObjectSchema,
});
