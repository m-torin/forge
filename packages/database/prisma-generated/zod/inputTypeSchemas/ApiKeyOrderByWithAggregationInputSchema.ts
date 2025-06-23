import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ApiKeyCountOrderByAggregateInputSchema } from './ApiKeyCountOrderByAggregateInputSchema';
import { ApiKeyAvgOrderByAggregateInputSchema } from './ApiKeyAvgOrderByAggregateInputSchema';
import { ApiKeyMaxOrderByAggregateInputSchema } from './ApiKeyMaxOrderByAggregateInputSchema';
import { ApiKeyMinOrderByAggregateInputSchema } from './ApiKeyMinOrderByAggregateInputSchema';
import { ApiKeySumOrderByAggregateInputSchema } from './ApiKeySumOrderByAggregateInputSchema';

export const ApiKeyOrderByWithAggregationInputSchema: z.ZodType<Prisma.ApiKeyOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      start: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      prefix: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      key: z.lazy(() => SortOrderSchema).optional(),
      keyHash: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      organizationId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      refillInterval: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      refillAmount: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRefillAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastUsedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      enabled: z.lazy(() => SortOrderSchema).optional(),
      rateLimitEnabled: z.lazy(() => SortOrderSchema).optional(),
      rateLimitTimeWindow: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      rateLimitMax: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      requestCount: z.lazy(() => SortOrderSchema).optional(),
      remaining: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastRequest: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      expiresAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      permissions: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => ApiKeyCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => ApiKeyAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => ApiKeyMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => ApiKeyMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => ApiKeySumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default ApiKeyOrderByWithAggregationInputSchema;
