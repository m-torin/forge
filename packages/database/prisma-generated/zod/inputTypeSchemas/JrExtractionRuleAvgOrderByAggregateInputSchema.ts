import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrExtractionRuleAvgOrderByAggregateInputSchema: z.ZodType<Prisma.JrExtractionRuleAvgOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      jollyRogerId: z.lazy(() => SortOrderSchema).optional(),
      successRate: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JrExtractionRuleAvgOrderByAggregateInputSchema;
