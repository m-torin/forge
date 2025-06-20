import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// API KEY SCHEMA
/////////////////////////////////////////

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string().nullable(),
  prefix: z.string().nullable(),
  key: z.string(),
  keyHash: z.string().nullable(),
  userId: z.string(),
  organizationId: z.string().nullable(),
  refillInterval: z.number().int().nullable(),
  refillAmount: z.number().int().nullable(),
  lastRefillAt: z.coerce.date().nullable(),
  lastUsedAt: z.coerce.date().nullable(),
  enabled: z.boolean(),
  rateLimitEnabled: z.boolean(),
  rateLimitTimeWindow: z.number().int().nullable(),
  rateLimitMax: z.number().int().nullable(),
  requestCount: z.number().int(),
  remaining: z.number().int().nullable(),
  lastRequest: z.coerce.date().nullable(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  permissions: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
})

export type ApiKey = z.infer<typeof ApiKeySchema>

export default ApiKeySchema;
