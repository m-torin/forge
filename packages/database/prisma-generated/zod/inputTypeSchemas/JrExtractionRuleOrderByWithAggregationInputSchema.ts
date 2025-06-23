import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { JrExtractionRuleCountOrderByAggregateInputSchema } from './JrExtractionRuleCountOrderByAggregateInputSchema';
import { JrExtractionRuleAvgOrderByAggregateInputSchema } from './JrExtractionRuleAvgOrderByAggregateInputSchema';
import { JrExtractionRuleMaxOrderByAggregateInputSchema } from './JrExtractionRuleMaxOrderByAggregateInputSchema';
import { JrExtractionRuleMinOrderByAggregateInputSchema } from './JrExtractionRuleMinOrderByAggregateInputSchema';
import { JrExtractionRuleSumOrderByAggregateInputSchema } from './JrExtractionRuleSumOrderByAggregateInputSchema';

export const JrExtractionRuleOrderByWithAggregationInputSchema: z.ZodType<Prisma.JrExtractionRuleOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      jollyRogerId: z.lazy(() => SortOrderSchema).optional(),
      fieldName: z.lazy(() => SortOrderSchema).optional(),
      isActive: z.lazy(() => SortOrderSchema).optional(),
      selectors: z.lazy(() => SortOrderSchema).optional(),
      mustContain: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      cannotContain: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastSuccessfulSelector: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      successRate: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastTestedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      notes: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => JrExtractionRuleCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => JrExtractionRuleAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => JrExtractionRuleMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => JrExtractionRuleMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => JrExtractionRuleSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default JrExtractionRuleOrderByWithAggregationInputSchema;
