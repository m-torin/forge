import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { OrganizationOrderByWithRelationInputSchema } from './OrganizationOrderByWithRelationInputSchema';
import { InvitationOrderByRelationAggregateInputSchema } from './InvitationOrderByRelationAggregateInputSchema';
import { TeamMemberOrderByRelationAggregateInputSchema } from './TeamMemberOrderByRelationAggregateInputSchema';

export const TeamOrderByWithRelationInputSchema: z.ZodType<Prisma.TeamOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  organizationId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  organization: z.lazy(() => OrganizationOrderByWithRelationInputSchema).optional(),
  invitations: z.lazy(() => InvitationOrderByRelationAggregateInputSchema).optional(),
  teamMembers: z.lazy(() => TeamMemberOrderByRelationAggregateInputSchema).optional()
}).strict();

export default TeamOrderByWithRelationInputSchema;
