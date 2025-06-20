import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.InventoryMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  variantId: z.lazy(() => SortOrderSchema).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  reserved: z.lazy(() => SortOrderSchema).optional(),
  available: z.lazy(() => SortOrderSchema).optional(),
  lowStockThreshold: z.lazy(() => SortOrderSchema).optional(),
  locationId: z.lazy(() => SortOrderSchema).optional(),
  locationName: z.lazy(() => SortOrderSchema).optional(),
  lastRestockedAt: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default InventoryMinOrderByAggregateInputSchema;
