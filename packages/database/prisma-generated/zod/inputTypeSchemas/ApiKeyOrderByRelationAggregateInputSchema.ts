import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ApiKeyOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ApiKeyOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ApiKeyOrderByRelationAggregateInputSchema;
