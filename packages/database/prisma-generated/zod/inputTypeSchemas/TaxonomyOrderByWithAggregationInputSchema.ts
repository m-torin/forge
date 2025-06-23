import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TaxonomyCountOrderByAggregateInputSchema } from './TaxonomyCountOrderByAggregateInputSchema';
import { TaxonomyAvgOrderByAggregateInputSchema } from './TaxonomyAvgOrderByAggregateInputSchema';
import { TaxonomyMaxOrderByAggregateInputSchema } from './TaxonomyMaxOrderByAggregateInputSchema';
import { TaxonomyMinOrderByAggregateInputSchema } from './TaxonomyMinOrderByAggregateInputSchema';
import { TaxonomySumOrderByAggregateInputSchema } from './TaxonomySumOrderByAggregateInputSchema';

export const TaxonomyOrderByWithAggregationInputSchema: z.ZodType<Prisma.TaxonomyOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      level: z.lazy(() => SortOrderSchema).optional(),
      path: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => TaxonomyCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => TaxonomyAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => TaxonomyMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => TaxonomyMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => TaxonomySumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default TaxonomyOrderByWithAggregationInputSchema;
