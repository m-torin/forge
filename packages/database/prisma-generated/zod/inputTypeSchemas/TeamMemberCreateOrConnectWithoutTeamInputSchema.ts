import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberCreateWithoutTeamInputSchema } from './TeamMemberCreateWithoutTeamInputSchema';
import { TeamMemberUncheckedCreateWithoutTeamInputSchema } from './TeamMemberUncheckedCreateWithoutTeamInputSchema';

export const TeamMemberCreateOrConnectWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberCreateOrConnectWithoutTeamInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TeamMemberCreateWithoutTeamInputSchema),
        z.lazy(() => TeamMemberUncheckedCreateWithoutTeamInputSchema),
      ]),
    })
    .strict();

export default TeamMemberCreateOrConnectWithoutTeamInputSchema;
