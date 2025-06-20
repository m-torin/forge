import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrFindReplaceRejectOrderByRelationAggregateInputSchema: z.ZodType<Prisma.JrFindReplaceRejectOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default JrFindReplaceRejectOrderByRelationAggregateInputSchema;
