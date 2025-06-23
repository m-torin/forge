import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JollyRogerMinOrderByAggregateInputSchema: z.ZodType<Prisma.JollyRogerMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      canChart: z.lazy(() => SortOrderSchema).optional(),
      chartingMethod: z.lazy(() => SortOrderSchema).optional(),
      brandId: z.lazy(() => SortOrderSchema).optional(),
      sitemaps: z.lazy(() => SortOrderSchema).optional(),
      gridUrls: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JollyRogerMinOrderByAggregateInputSchema;
