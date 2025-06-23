import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventoryTransactionSumOrderByAggregateInputSchema: z.ZodType<Prisma.InventoryTransactionSumOrderByAggregateInput> =
  z
    .object({
      quantity: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default InventoryTransactionSumOrderByAggregateInputSchema;
