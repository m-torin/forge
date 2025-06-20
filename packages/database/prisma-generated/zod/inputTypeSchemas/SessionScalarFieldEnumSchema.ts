import { z } from 'zod';

export const SessionScalarFieldEnumSchema = z.enum(['id','expiresAt','token','createdAt','updatedAt','ipAddress','userAgent','userId','activeOrganizationId','impersonatedBy']);

export default SessionScalarFieldEnumSchema;
