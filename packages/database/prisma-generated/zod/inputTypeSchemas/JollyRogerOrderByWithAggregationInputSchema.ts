import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { JollyRogerCountOrderByAggregateInputSchema } from './JollyRogerCountOrderByAggregateInputSchema';
import { JollyRogerAvgOrderByAggregateInputSchema } from './JollyRogerAvgOrderByAggregateInputSchema';
import { JollyRogerMaxOrderByAggregateInputSchema } from './JollyRogerMaxOrderByAggregateInputSchema';
import { JollyRogerMinOrderByAggregateInputSchema } from './JollyRogerMinOrderByAggregateInputSchema';
import { JollyRogerSumOrderByAggregateInputSchema } from './JollyRogerSumOrderByAggregateInputSchema';

export const JollyRogerOrderByWithAggregationInputSchema: z.ZodType<Prisma.JollyRogerOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  canChart: z.lazy(() => SortOrderSchema).optional(),
  chartingMethod: z.lazy(() => SortOrderSchema).optional(),
  brandId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sitemaps: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  gridUrls: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  pdpUrlPatterns: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => JollyRogerCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => JollyRogerAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => JollyRogerMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => JollyRogerMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => JollyRogerSumOrderByAggregateInputSchema).optional()
}).strict();

export default JollyRogerOrderByWithAggregationInputSchema;
