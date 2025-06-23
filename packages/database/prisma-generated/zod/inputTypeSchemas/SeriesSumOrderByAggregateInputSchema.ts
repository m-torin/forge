import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const SeriesSumOrderByAggregateInputSchema: z.ZodType<Prisma.SeriesSumOrderByAggregateInput> =
  z
    .object({
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default SeriesSumOrderByAggregateInputSchema;
