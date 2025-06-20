import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberScalarWhereInputSchema } from './TeamMemberScalarWhereInputSchema';
import { TeamMemberUpdateManyMutationInputSchema } from './TeamMemberUpdateManyMutationInputSchema';
import { TeamMemberUncheckedUpdateManyWithoutTeamInputSchema } from './TeamMemberUncheckedUpdateManyWithoutTeamInputSchema';

export const TeamMemberUpdateManyWithWhereWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberUpdateManyWithWhereWithoutTeamInput> = z.object({
  where: z.lazy(() => TeamMemberScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TeamMemberUpdateManyMutationInputSchema),z.lazy(() => TeamMemberUncheckedUpdateManyWithoutTeamInputSchema) ]),
}).strict();

export default TeamMemberUpdateManyWithWhereWithoutTeamInputSchema;
