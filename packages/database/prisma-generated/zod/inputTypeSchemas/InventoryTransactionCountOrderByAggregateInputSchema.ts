import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventoryTransactionCountOrderByAggregateInputSchema: z.ZodType<Prisma.InventoryTransactionCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      inventoryId: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      quantity: z.lazy(() => SortOrderSchema).optional(),
      referenceType: z.lazy(() => SortOrderSchema).optional(),
      referenceId: z.lazy(() => SortOrderSchema).optional(),
      notes: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default InventoryTransactionCountOrderByAggregateInputSchema;
