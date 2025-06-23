import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { StoryCountOrderByAggregateInputSchema } from './StoryCountOrderByAggregateInputSchema';
import { StoryAvgOrderByAggregateInputSchema } from './StoryAvgOrderByAggregateInputSchema';
import { StoryMaxOrderByAggregateInputSchema } from './StoryMaxOrderByAggregateInputSchema';
import { StoryMinOrderByAggregateInputSchema } from './StoryMinOrderByAggregateInputSchema';
import { StorySumOrderByAggregateInputSchema } from './StorySumOrderByAggregateInputSchema';

export const StoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.StoryOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      seriesId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      fandomId: z.lazy(() => SortOrderSchema).optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      isFictional: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => StoryCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => StoryAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => StoryMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => StoryMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => StorySumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default StoryOrderByWithAggregationInputSchema;
