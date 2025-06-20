import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { SeriesCountOrderByAggregateInputSchema } from './SeriesCountOrderByAggregateInputSchema';
import { SeriesAvgOrderByAggregateInputSchema } from './SeriesAvgOrderByAggregateInputSchema';
import { SeriesMaxOrderByAggregateInputSchema } from './SeriesMaxOrderByAggregateInputSchema';
import { SeriesMinOrderByAggregateInputSchema } from './SeriesMinOrderByAggregateInputSchema';
import { SeriesSumOrderByAggregateInputSchema } from './SeriesSumOrderByAggregateInputSchema';

export const SeriesOrderByWithAggregationInputSchema: z.ZodType<Prisma.SeriesOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  fandomId: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  isFictional: z.lazy(() => SortOrderSchema).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => SeriesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => SeriesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SeriesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SeriesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => SeriesSumOrderByAggregateInputSchema).optional()
}).strict();

export default SeriesOrderByWithAggregationInputSchema;
