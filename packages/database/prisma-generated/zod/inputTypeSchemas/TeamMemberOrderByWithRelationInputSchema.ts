import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { TeamOrderByWithRelationInputSchema } from './TeamOrderByWithRelationInputSchema';

export const TeamMemberOrderByWithRelationInputSchema: z.ZodType<Prisma.TeamMemberOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      teamId: z.lazy(() => SortOrderSchema).optional(),
      role: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      team: z.lazy(() => TeamOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default TeamMemberOrderByWithRelationInputSchema;
