import { z } from 'zod';

export const AuditLogScalarFieldEnumSchema = z.enum([
  'id',
  'entityType',
  'entityId',
  'flowId',
  'changeType',
  'before',
  'after',
  'userId',
  'timestamp',
]);
