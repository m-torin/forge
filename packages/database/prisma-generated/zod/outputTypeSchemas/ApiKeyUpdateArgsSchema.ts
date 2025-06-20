import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyIncludeSchema } from '../inputTypeSchemas/ApiKeyIncludeSchema'
import { ApiKeyUpdateInputSchema } from '../inputTypeSchemas/ApiKeyUpdateInputSchema'
import { ApiKeyUncheckedUpdateInputSchema } from '../inputTypeSchemas/ApiKeyUncheckedUpdateInputSchema'
import { ApiKeyWhereUniqueInputSchema } from '../inputTypeSchemas/ApiKeyWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const ApiKeyUpdateArgsSchema: z.ZodType<Prisma.ApiKeyUpdateArgs> = z.object({
  select: ApiKeySelectSchema.optional(),
  include: z.lazy(() => ApiKeyIncludeSchema).optional(),
  data: z.union([ ApiKeyUpdateInputSchema,ApiKeyUncheckedUpdateInputSchema ]),
  where: ApiKeyWhereUniqueInputSchema,
}).strict() ;

export default ApiKeyUpdateArgsSchema;
