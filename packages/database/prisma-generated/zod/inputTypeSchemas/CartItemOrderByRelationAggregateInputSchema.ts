import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CartItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CartItemOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default CartItemOrderByRelationAggregateInputSchema;
