import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateNestedOneWithoutTeamMembersInputSchema } from './TeamCreateNestedOneWithoutTeamMembersInputSchema';

export const TeamMemberCreateWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberCreateWithoutUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      role: z.string().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      team: z.lazy(() => TeamCreateNestedOneWithoutTeamMembersInputSchema),
    })
    .strict();

export default TeamMemberCreateWithoutUserInputSchema;
