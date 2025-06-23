import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { PdpJoinCountOrderByAggregateInputSchema } from './PdpJoinCountOrderByAggregateInputSchema';
import { PdpJoinMaxOrderByAggregateInputSchema } from './PdpJoinMaxOrderByAggregateInputSchema';
import { PdpJoinMinOrderByAggregateInputSchema } from './PdpJoinMinOrderByAggregateInputSchema';

export const PdpJoinOrderByWithAggregationInputSchema: z.ZodType<Prisma.PdpJoinOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      productId: z.lazy(() => SortOrderSchema).optional(),
      brandId: z.lazy(() => SortOrderSchema).optional(),
      canonicalUrl: z.lazy(() => SortOrderSchema).optional(),
      iframeUrl: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      tempMediaUrls: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      lastScanned: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => PdpJoinCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => PdpJoinMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => PdpJoinMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default PdpJoinOrderByWithAggregationInputSchema;
