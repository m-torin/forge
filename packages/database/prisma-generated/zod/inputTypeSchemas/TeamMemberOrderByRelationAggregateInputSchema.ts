import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TeamMemberOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TeamMemberOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default TeamMemberOrderByRelationAggregateInputSchema;
