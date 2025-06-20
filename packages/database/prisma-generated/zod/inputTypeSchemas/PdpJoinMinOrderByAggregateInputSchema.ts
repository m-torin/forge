import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PdpJoinMinOrderByAggregateInputSchema: z.ZodType<Prisma.PdpJoinMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  productId: z.lazy(() => SortOrderSchema).optional(),
  brandId: z.lazy(() => SortOrderSchema).optional(),
  canonicalUrl: z.lazy(() => SortOrderSchema).optional(),
  iframeUrl: z.lazy(() => SortOrderSchema).optional(),
  tempMediaUrls: z.lazy(() => SortOrderSchema).optional(),
  lastScanned: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PdpJoinMinOrderByAggregateInputSchema;
