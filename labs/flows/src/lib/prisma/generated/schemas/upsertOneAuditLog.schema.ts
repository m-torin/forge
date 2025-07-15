import { z } from 'zod';
import { AuditLogSelectObjectSchema } from './objects/AuditLogSelect.schema';
import { AuditLogIncludeObjectSchema } from './objects/AuditLogInclude.schema';
import { AuditLogWhereUniqueInputObjectSchema } from './objects/AuditLogWhereUniqueInput.schema';
import { AuditLogCreateInputObjectSchema } from './objects/AuditLogCreateInput.schema';
import { AuditLogUncheckedCreateInputObjectSchema } from './objects/AuditLogUncheckedCreateInput.schema';
import { AuditLogUpdateInputObjectSchema } from './objects/AuditLogUpdateInput.schema';
import { AuditLogUncheckedUpdateInputObjectSchema } from './objects/AuditLogUncheckedUpdateInput.schema';

export const AuditLogUpsertSchema = z.object({
  select: AuditLogSelectObjectSchema.optional(),
  include: AuditLogIncludeObjectSchema.optional(),
  where: AuditLogWhereUniqueInputObjectSchema,
  create: z.union([
    AuditLogCreateInputObjectSchema,
    AuditLogUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    AuditLogUpdateInputObjectSchema,
    AuditLogUncheckedUpdateInputObjectSchema,
  ]),
});
