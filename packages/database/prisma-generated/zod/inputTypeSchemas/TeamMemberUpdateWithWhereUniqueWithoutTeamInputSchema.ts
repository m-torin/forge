import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithoutTeamInputSchema } from './TeamMemberUpdateWithoutTeamInputSchema';
import { TeamMemberUncheckedUpdateWithoutTeamInputSchema } from './TeamMemberUncheckedUpdateWithoutTeamInputSchema';

export const TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberUpdateWithWhereUniqueWithoutTeamInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TeamMemberUpdateWithoutTeamInputSchema),
        z.lazy(() => TeamMemberUncheckedUpdateWithoutTeamInputSchema),
      ]),
    })
    .strict();

export default TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema;
