import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TwoFactorCountOrderByAggregateInputSchema } from './TwoFactorCountOrderByAggregateInputSchema';
import { TwoFactorMaxOrderByAggregateInputSchema } from './TwoFactorMaxOrderByAggregateInputSchema';
import { TwoFactorMinOrderByAggregateInputSchema } from './TwoFactorMinOrderByAggregateInputSchema';

export const TwoFactorOrderByWithAggregationInputSchema: z.ZodType<Prisma.TwoFactorOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  secret: z.lazy(() => SortOrderSchema).optional(),
  secretHash: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  enabled: z.lazy(() => SortOrderSchema).optional(),
  verified: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TwoFactorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TwoFactorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TwoFactorMinOrderByAggregateInputSchema).optional()
}).strict();

export default TwoFactorOrderByWithAggregationInputSchema;
