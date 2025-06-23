import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrganizationCreateNestedOneWithoutTeamsInputSchema } from './OrganizationCreateNestedOneWithoutTeamsInputSchema';
import { InvitationCreateNestedManyWithoutTeamInputSchema } from './InvitationCreateNestedManyWithoutTeamInputSchema';

export const TeamCreateWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamCreateWithoutTeamMembersInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      organization: z.lazy(() => OrganizationCreateNestedOneWithoutTeamsInputSchema),
      invitations: z.lazy(() => InvitationCreateNestedManyWithoutTeamInputSchema).optional(),
    })
    .strict();

export default TeamCreateWithoutTeamMembersInputSchema;
