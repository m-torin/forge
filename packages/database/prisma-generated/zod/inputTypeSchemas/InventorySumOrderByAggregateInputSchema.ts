import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventorySumOrderByAggregateInputSchema: z.ZodType<Prisma.InventorySumOrderByAggregateInput> =
  z
    .object({
      quantity: z.lazy(() => SortOrderSchema).optional(),
      reserved: z.lazy(() => SortOrderSchema).optional(),
      available: z.lazy(() => SortOrderSchema).optional(),
      lowStockThreshold: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default InventorySumOrderByAggregateInputSchema;
