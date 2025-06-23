import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { JrFindReplaceRejectCountOrderByAggregateInputSchema } from './JrFindReplaceRejectCountOrderByAggregateInputSchema';
import { JrFindReplaceRejectAvgOrderByAggregateInputSchema } from './JrFindReplaceRejectAvgOrderByAggregateInputSchema';
import { JrFindReplaceRejectMaxOrderByAggregateInputSchema } from './JrFindReplaceRejectMaxOrderByAggregateInputSchema';
import { JrFindReplaceRejectMinOrderByAggregateInputSchema } from './JrFindReplaceRejectMinOrderByAggregateInputSchema';
import { JrFindReplaceRejectSumOrderByAggregateInputSchema } from './JrFindReplaceRejectSumOrderByAggregateInputSchema';

export const JrFindReplaceRejectOrderByWithAggregationInputSchema: z.ZodType<Prisma.JrFindReplaceRejectOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      lookFor: z.lazy(() => SortOrderSchema).optional(),
      replaceWith: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      ruleAction: z.lazy(() => SortOrderSchema).optional(),
      isRegex: z.lazy(() => SortOrderSchema).optional(),
      regexFlags: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      priority: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => JrFindReplaceRejectCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => JrFindReplaceRejectAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => JrFindReplaceRejectMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => JrFindReplaceRejectMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => JrFindReplaceRejectSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default JrFindReplaceRejectOrderByWithAggregationInputSchema;
