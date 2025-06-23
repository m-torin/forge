import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const FavoriteJoinOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FavoriteJoinOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default FavoriteJoinOrderByRelationAggregateInputSchema;
