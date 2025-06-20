import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { InventoryTransactionOrderByRelationAggregateInputSchema } from './InventoryTransactionOrderByRelationAggregateInputSchema';

export const InventoryOrderByWithRelationInputSchema: z.ZodType<Prisma.InventoryOrderByWithRelationInput> = z.object({
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
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  variant: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  transactions: z.lazy(() => InventoryTransactionOrderByRelationAggregateInputSchema).optional()
}).strict();

export default InventoryOrderByWithRelationInputSchema;
