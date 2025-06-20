import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventoryTransactionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.InventoryTransactionAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default InventoryTransactionAvgOrderByAggregateInputSchema;
