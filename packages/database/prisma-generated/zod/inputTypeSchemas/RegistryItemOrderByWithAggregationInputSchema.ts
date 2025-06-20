import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { RegistryItemCountOrderByAggregateInputSchema } from './RegistryItemCountOrderByAggregateInputSchema';
import { RegistryItemAvgOrderByAggregateInputSchema } from './RegistryItemAvgOrderByAggregateInputSchema';
import { RegistryItemMaxOrderByAggregateInputSchema } from './RegistryItemMaxOrderByAggregateInputSchema';
import { RegistryItemMinOrderByAggregateInputSchema } from './RegistryItemMinOrderByAggregateInputSchema';
import { RegistryItemSumOrderByAggregateInputSchema } from './RegistryItemSumOrderByAggregateInputSchema';

export const RegistryItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.RegistryItemOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  purchased: z.lazy(() => SortOrderSchema).optional(),
  registryId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  collectionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => RegistryItemCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => RegistryItemAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RegistryItemMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RegistryItemMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => RegistryItemSumOrderByAggregateInputSchema).optional()
}).strict();

export default RegistryItemOrderByWithAggregationInputSchema;
