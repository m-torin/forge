import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema } from './TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema';

export const TeamUncheckedCreateWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamUncheckedCreateWithoutInvitationsInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      organizationId: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      teamMembers: z
        .lazy(() => TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema)
        .optional(),
    })
    .strict();

export default TeamUncheckedCreateWithoutInvitationsInputSchema;
