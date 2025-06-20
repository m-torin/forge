import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BrandCountOrderByAggregateInputSchema } from './BrandCountOrderByAggregateInputSchema';
import { BrandAvgOrderByAggregateInputSchema } from './BrandAvgOrderByAggregateInputSchema';
import { BrandMaxOrderByAggregateInputSchema } from './BrandMaxOrderByAggregateInputSchema';
import { BrandMinOrderByAggregateInputSchema } from './BrandMinOrderByAggregateInputSchema';
import { BrandSumOrderByAggregateInputSchema } from './BrandSumOrderByAggregateInputSchema';

export const BrandOrderByWithAggregationInputSchema: z.ZodType<Prisma.BrandOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  baseUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => BrandCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BrandAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BrandMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BrandMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BrandSumOrderByAggregateInputSchema).optional()
}).strict();

export default BrandOrderByWithAggregationInputSchema;
