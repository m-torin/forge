import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { InventoryCountOrderByAggregateInputSchema } from './InventoryCountOrderByAggregateInputSchema';
import { InventoryAvgOrderByAggregateInputSchema } from './InventoryAvgOrderByAggregateInputSchema';
import { InventoryMaxOrderByAggregateInputSchema } from './InventoryMaxOrderByAggregateInputSchema';
import { InventoryMinOrderByAggregateInputSchema } from './InventoryMinOrderByAggregateInputSchema';
import { InventorySumOrderByAggregateInputSchema } from './InventorySumOrderByAggregateInputSchema';

export const InventoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.InventoryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  variantId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  reserved: z.lazy(() => SortOrderSchema).optional(),
  available: z.lazy(() => SortOrderSchema).optional(),
  lowStockThreshold: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locationId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locationName: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastRestockedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  metadata: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => InventoryCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => InventoryAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => InventoryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => InventoryMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => InventorySumOrderByAggregateInputSchema).optional()
}).strict();

export default InventoryOrderByWithAggregationInputSchema;
