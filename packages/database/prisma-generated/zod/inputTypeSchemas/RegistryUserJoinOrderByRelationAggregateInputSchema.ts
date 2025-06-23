import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryUserJoinOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RegistryUserJoinOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default RegistryUserJoinOrderByRelationAggregateInputSchema;
