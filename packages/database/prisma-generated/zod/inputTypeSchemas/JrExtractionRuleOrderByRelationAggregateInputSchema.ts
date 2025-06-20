import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrExtractionRuleOrderByRelationAggregateInputSchema: z.ZodType<Prisma.JrExtractionRuleOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default JrExtractionRuleOrderByRelationAggregateInputSchema;
