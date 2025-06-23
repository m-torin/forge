import { z } from 'zod';

export const ApiKeyScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'start',
  'prefix',
  'key',
  'keyHash',
  'userId',
  'organizationId',
  'refillInterval',
  'refillAmount',
  'lastRefillAt',
  'lastUsedAt',
  'enabled',
  'rateLimitEnabled',
  'rateLimitTimeWindow',
  'rateLimitMax',
  'requestCount',
  'remaining',
  'lastRequest',
  'expiresAt',
  'createdAt',
  'updatedAt',
  'permissions',
  'metadata',
]);

export default ApiKeyScalarFieldEnumSchema;
