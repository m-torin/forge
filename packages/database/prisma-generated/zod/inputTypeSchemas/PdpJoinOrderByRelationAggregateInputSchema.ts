import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PdpJoinOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PdpJoinOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default PdpJoinOrderByRelationAggregateInputSchema;
