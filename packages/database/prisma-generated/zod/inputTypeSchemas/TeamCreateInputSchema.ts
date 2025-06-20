import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateNestedOneWithoutTeamsInputSchema } from './OrganizationCreateNestedOneWithoutTeamsInputSchema';
import { InvitationCreateNestedManyWithoutTeamInputSchema } from './InvitationCreateNestedManyWithoutTeamInputSchema';
import { TeamMemberCreateNestedManyWithoutTeamInputSchema } from './TeamMemberCreateNestedManyWithoutTeamInputSchema';

export const TeamCreateInputSchema: z.ZodType<Prisma.TeamCreateInput> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  organization: z.lazy(() => OrganizationCreateNestedOneWithoutTeamsInputSchema),
  invitations: z.lazy(() => InvitationCreateNestedManyWithoutTeamInputSchema).optional(),
  teamMembers: z.lazy(() => TeamMemberCreateNestedManyWithoutTeamInputSchema).optional()
}).strict();

export default TeamCreateInputSchema;
