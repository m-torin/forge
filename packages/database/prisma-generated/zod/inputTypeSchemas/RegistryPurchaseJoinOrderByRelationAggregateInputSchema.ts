import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryPurchaseJoinOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RegistryPurchaseJoinOrderByRelationAggregateInputSchema;
