import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithoutTeamInputSchema } from './TeamMemberUpdateWithoutTeamInputSchema';
import { TeamMemberUncheckedUpdateWithoutTeamInputSchema } from './TeamMemberUncheckedUpdateWithoutTeamInputSchema';
import { TeamMemberCreateWithoutTeamInputSchema } from './TeamMemberCreateWithoutTeamInputSchema';
import { TeamMemberUncheckedCreateWithoutTeamInputSchema } from './TeamMemberUncheckedCreateWithoutTeamInputSchema';

export const TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberUpsertWithWhereUniqueWithoutTeamInput> = z.object({
  where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => TeamMemberUpdateWithoutTeamInputSchema),z.lazy(() => TeamMemberUncheckedUpdateWithoutTeamInputSchema) ]),
  create: z.union([ z.lazy(() => TeamMemberCreateWithoutTeamInputSchema),z.lazy(() => TeamMemberUncheckedCreateWithoutTeamInputSchema) ]),
}).strict();

export default TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema;
