import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CastOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CastOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default CastOrderByRelationAggregateInputSchema;
