import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewAvgOrderByAggregateInput> =
  z
    .object({
      rating: z.lazy(() => SortOrderSchema).optional(),
      helpfulCount: z.lazy(() => SortOrderSchema).optional(),
      totalVotes: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default ReviewAvgOrderByAggregateInputSchema;
