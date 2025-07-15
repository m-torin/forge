import { z } from 'zod';
import { AuditLogCreateManyInputObjectSchema } from './objects/AuditLogCreateManyInput.schema';

export const AuditLogCreateManySchema = z.object({
  data: z.union([
    AuditLogCreateManyInputObjectSchema,
    z.array(AuditLogCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
