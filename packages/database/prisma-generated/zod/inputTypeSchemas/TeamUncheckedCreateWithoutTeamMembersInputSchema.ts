import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationUncheckedCreateNestedManyWithoutTeamInputSchema } from './InvitationUncheckedCreateNestedManyWithoutTeamInputSchema';

export const TeamUncheckedCreateWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamUncheckedCreateWithoutTeamMembersInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional().nullable(),
      organizationId: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional().nullable(),
      invitations: z
        .lazy(() => InvitationUncheckedCreateNestedManyWithoutTeamInputSchema)
        .optional(),
    })
    .strict();

export default TeamUncheckedCreateWithoutTeamMembersInputSchema;
