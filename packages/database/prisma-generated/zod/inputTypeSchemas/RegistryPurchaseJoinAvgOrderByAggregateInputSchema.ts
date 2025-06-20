import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryPurchaseJoinAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinAvgOrderByAggregateInput> = z.object({
  quantity: z.lazy(() => SortOrderSchema).optional(),
  price: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RegistryPurchaseJoinAvgOrderByAggregateInputSchema;
