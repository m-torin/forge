import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const StorySumOrderByAggregateInputSchema: z.ZodType<Prisma.StorySumOrderByAggregateInput> =
  z
    .object({
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default StorySumOrderByAggregateInputSchema;
