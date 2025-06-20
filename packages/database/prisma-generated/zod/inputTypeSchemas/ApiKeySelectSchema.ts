import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const ApiKeySelectSchema: z.ZodType<Prisma.ApiKeySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  start: z.boolean().optional(),
  prefix: z.boolean().optional(),
  key: z.boolean().optional(),
  keyHash: z.boolean().optional(),
  userId: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  refillInterval: z.boolean().optional(),
  refillAmount: z.boolean().optional(),
  lastRefillAt: z.boolean().optional(),
  lastUsedAt: z.boolean().optional(),
  enabled: z.boolean().optional(),
  rateLimitEnabled: z.boolean().optional(),
  rateLimitTimeWindow: z.boolean().optional(),
  rateLimitMax: z.boolean().optional(),
  requestCount: z.boolean().optional(),
  remaining: z.boolean().optional(),
  lastRequest: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  permissions: z.boolean().optional(),
  metadata: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default ApiKeySelectSchema;
