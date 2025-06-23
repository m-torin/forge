import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateNestedManyWithoutTeamInputSchema } from './InvitationCreateNestedManyWithoutTeamInputSchema';
import { TeamMemberCreateNestedManyWithoutTeamInputSchema } from './TeamMemberCreateNestedManyWithoutTeamInputSchema';

export const TeamCreateWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamCreateWithoutOrganizationInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      invitations: z.lazy(() => InvitationCreateNestedManyWithoutTeamInputSchema).optional(),
      teamMembers: z.lazy(() => TeamMemberCreateNestedManyWithoutTeamInputSchema).optional(),
    })
    .strict();

export default TeamCreateWithoutOrganizationInputSchema;
