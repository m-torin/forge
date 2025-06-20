import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrExtractionRuleCountOrderByAggregateInputSchema: z.ZodType<Prisma.JrExtractionRuleCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  jollyRogerId: z.lazy(() => SortOrderSchema).optional(),
  fieldName: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  selectors: z.lazy(() => SortOrderSchema).optional(),
  mustContain: z.lazy(() => SortOrderSchema).optional(),
  cannotContain: z.lazy(() => SortOrderSchema).optional(),
  lastSuccessfulSelector: z.lazy(() => SortOrderSchema).optional(),
  successRate: z.lazy(() => SortOrderSchema).optional(),
  lastTestedAt: z.lazy(() => SortOrderSchema).optional(),
  notes: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default JrExtractionRuleCountOrderByAggregateInputSchema;
