import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { InventoryTransactionCountOrderByAggregateInputSchema } from './InventoryTransactionCountOrderByAggregateInputSchema';
import { InventoryTransactionAvgOrderByAggregateInputSchema } from './InventoryTransactionAvgOrderByAggregateInputSchema';
import { InventoryTransactionMaxOrderByAggregateInputSchema } from './InventoryTransactionMaxOrderByAggregateInputSchema';
import { InventoryTransactionMinOrderByAggregateInputSchema } from './InventoryTransactionMinOrderByAggregateInputSchema';
import { InventoryTransactionSumOrderByAggregateInputSchema } from './InventoryTransactionSumOrderByAggregateInputSchema';

export const InventoryTransactionOrderByWithAggregationInputSchema: z.ZodType<Prisma.InventoryTransactionOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      inventoryId: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      quantity: z.lazy(() => SortOrderSchema).optional(),
      referenceType: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      referenceId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      notes: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => InventoryTransactionCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => InventoryTransactionAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => InventoryTransactionMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => InventoryTransactionMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => InventoryTransactionSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default InventoryTransactionOrderByWithAggregationInputSchema;
