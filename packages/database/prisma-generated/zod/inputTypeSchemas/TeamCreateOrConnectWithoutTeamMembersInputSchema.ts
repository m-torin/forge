import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamCreateWithoutTeamMembersInputSchema } from './TeamCreateWithoutTeamMembersInputSchema';
import { TeamUncheckedCreateWithoutTeamMembersInputSchema } from './TeamUncheckedCreateWithoutTeamMembersInputSchema';

export const TeamCreateOrConnectWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamCreateOrConnectWithoutTeamMembersInput> = z.object({
  where: z.lazy(() => TeamWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TeamCreateWithoutTeamMembersInputSchema),z.lazy(() => TeamUncheckedCreateWithoutTeamMembersInputSchema) ]),
}).strict();

export default TeamCreateOrConnectWithoutTeamMembersInputSchema;
