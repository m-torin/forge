import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationUncheckedCreateNestedManyWithoutTeamInputSchema } from './InvitationUncheckedCreateNestedManyWithoutTeamInputSchema';
import { TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema } from './TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema';

export const TeamUncheckedCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamUncheckedCreateWithoutOrganizationInput> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable(),
  invitations: z.lazy(() => InvitationUncheckedCreateNestedManyWithoutTeamInputSchema).optional(),
  teamMembers: z.lazy(() => TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema).optional()
}).strict();

export default TeamUncheckedCreateWithoutOrganizationInputSchema;
