import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const ApiKeyCreateManyInputSchema: z.ZodType<Prisma.ApiKeyCreateManyInput> = z
  .object({
    id: z.string(),
    name: z.string(),
    start: z.string().optional().nullable(),
    prefix: z.string().optional().nullable(),
    key: z.string(),
    keyHash: z.string().optional().nullable(),
    userId: z.string(),
    organizationId: z.string().optional().nullable(),
    refillInterval: z.number().int().optional().nullable(),
    refillAmount: z.number().int().optional().nullable(),
    lastRefillAt: z.coerce.date().optional().nullable(),
    lastUsedAt: z.coerce.date().optional().nullable(),
    enabled: z.boolean().optional(),
    rateLimitEnabled: z.boolean().optional(),
    rateLimitTimeWindow: z.number().int().optional().nullable(),
    rateLimitMax: z.number().int().optional().nullable(),
    requestCount: z.number().int().optional(),
    remaining: z.number().int().optional().nullable(),
    lastRequest: z.coerce.date().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    permissions: z.string().optional().nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
  })
  .strict();

export default ApiKeyCreateManyInputSchema;
