import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////

export const AuditLogSchema = z.object({
  id: z.string().cuid(),
  type: z.string(),
  action: z.string(),
  userId: z.string().nullable(),
  email: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  success: z.boolean(),
  errorMessage: z.string().nullable(),
  timestamp: z.coerce.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export default AuditLogSchema;
