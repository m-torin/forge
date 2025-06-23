import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CollectionCountOrderByAggregateInputSchema } from './CollectionCountOrderByAggregateInputSchema';
import { CollectionMaxOrderByAggregateInputSchema } from './CollectionMaxOrderByAggregateInputSchema';
import { CollectionMinOrderByAggregateInputSchema } from './CollectionMinOrderByAggregateInputSchema';

export const CollectionOrderByWithAggregationInputSchema: z.ZodType<Prisma.CollectionOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => CollectionCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => CollectionMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => CollectionMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default CollectionOrderByWithAggregationInputSchema;
