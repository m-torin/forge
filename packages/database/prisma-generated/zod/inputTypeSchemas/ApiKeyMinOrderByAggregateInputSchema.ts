import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ApiKeyMinOrderByAggregateInputSchema: z.ZodType<Prisma.ApiKeyMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  start: z.lazy(() => SortOrderSchema).optional(),
  prefix: z.lazy(() => SortOrderSchema).optional(),
  key: z.lazy(() => SortOrderSchema).optional(),
  keyHash: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  refillInterval: z.lazy(() => SortOrderSchema).optional(),
  refillAmount: z.lazy(() => SortOrderSchema).optional(),
  lastRefillAt: z.lazy(() => SortOrderSchema).optional(),
  lastUsedAt: z.lazy(() => SortOrderSchema).optional(),
  enabled: z.lazy(() => SortOrderSchema).optional(),
  rateLimitEnabled: z.lazy(() => SortOrderSchema).optional(),
  rateLimitTimeWindow: z.lazy(() => SortOrderSchema).optional(),
  rateLimitMax: z.lazy(() => SortOrderSchema).optional(),
  requestCount: z.lazy(() => SortOrderSchema).optional(),
  remaining: z.lazy(() => SortOrderSchema).optional(),
  lastRequest: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  permissions: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ApiKeyMinOrderByAggregateInputSchema;
