import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const SeriesOrderByRelationAggregateInputSchema: z.ZodType<Prisma.SeriesOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default SeriesOrderByRelationAggregateInputSchema;
