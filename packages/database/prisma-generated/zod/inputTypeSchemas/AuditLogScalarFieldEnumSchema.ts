import { z } from 'zod';

export const AuditLogScalarFieldEnumSchema = z.enum([
  'id',
  'type',
  'action',
  'userId',
  'email',
  'ipAddress',
  'userAgent',
  'metadata',
  'success',
  'errorMessage',
  'timestamp',
]);

export default AuditLogScalarFieldEnumSchema;
