import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { FandomCountOrderByAggregateInputSchema } from './FandomCountOrderByAggregateInputSchema';
import { FandomMaxOrderByAggregateInputSchema } from './FandomMaxOrderByAggregateInputSchema';
import { FandomMinOrderByAggregateInputSchema } from './FandomMinOrderByAggregateInputSchema';

export const FandomOrderByWithAggregationInputSchema: z.ZodType<Prisma.FandomOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  isFictional: z.lazy(() => SortOrderSchema).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => FandomCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FandomMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FandomMinOrderByAggregateInputSchema).optional()
}).strict();

export default FandomOrderByWithAggregationInputSchema;
