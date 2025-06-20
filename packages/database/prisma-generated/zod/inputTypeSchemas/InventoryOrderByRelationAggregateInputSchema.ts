import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const InventoryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.InventoryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default InventoryOrderByRelationAggregateInputSchema;
