import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CastCountOrderByAggregateInputSchema } from './CastCountOrderByAggregateInputSchema';
import { CastMaxOrderByAggregateInputSchema } from './CastMaxOrderByAggregateInputSchema';
import { CastMinOrderByAggregateInputSchema } from './CastMinOrderByAggregateInputSchema';

export const CastOrderByWithAggregationInputSchema: z.ZodType<Prisma.CastOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
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
      _count: z.lazy(() => CastCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => CastMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => CastMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default CastOrderByWithAggregationInputSchema;
