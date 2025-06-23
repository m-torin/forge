import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateNestedOneWithoutTeamsInputSchema } from './OrganizationCreateNestedOneWithoutTeamsInputSchema';
import { TeamMemberCreateNestedManyWithoutTeamInputSchema } from './TeamMemberCreateNestedManyWithoutTeamInputSchema';

export const TeamCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamCreateWithoutInvitationsInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      organization: z.lazy(() => OrganizationCreateNestedOneWithoutTeamsInputSchema),
      teamMembers: z.lazy(() => TeamMemberCreateNestedManyWithoutTeamInputSchema).optional(),
    })
    .strict();

export default TeamCreateWithoutInvitationsInputSchema;
