import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const FandomOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FandomOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default FandomOrderByRelationAggregateInputSchema;
