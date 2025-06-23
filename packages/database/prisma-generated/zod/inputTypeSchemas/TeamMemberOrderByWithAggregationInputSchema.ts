import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { TeamMemberCountOrderByAggregateInputSchema } from './TeamMemberCountOrderByAggregateInputSchema';
import { TeamMemberMaxOrderByAggregateInputSchema } from './TeamMemberMaxOrderByAggregateInputSchema';
import { TeamMemberMinOrderByAggregateInputSchema } from './TeamMemberMinOrderByAggregateInputSchema';

export const TeamMemberOrderByWithAggregationInputSchema: z.ZodType<Prisma.TeamMemberOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      teamId: z.lazy(() => SortOrderSchema).optional(),
      role: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => TeamMemberCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => TeamMemberMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => TeamMemberMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default TeamMemberOrderByWithAggregationInputSchema;
