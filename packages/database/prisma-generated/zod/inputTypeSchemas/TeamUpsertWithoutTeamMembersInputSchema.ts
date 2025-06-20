import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamUpdateWithoutTeamMembersInputSchema } from './TeamUpdateWithoutTeamMembersInputSchema';
import { TeamUncheckedUpdateWithoutTeamMembersInputSchema } from './TeamUncheckedUpdateWithoutTeamMembersInputSchema';
import { TeamCreateWithoutTeamMembersInputSchema } from './TeamCreateWithoutTeamMembersInputSchema';
import { TeamUncheckedCreateWithoutTeamMembersInputSchema } from './TeamUncheckedCreateWithoutTeamMembersInputSchema';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamUpsertWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamUpsertWithoutTeamMembersInput> = z.object({
  update: z.union([ z.lazy(() => TeamUpdateWithoutTeamMembersInputSchema),z.lazy(() => TeamUncheckedUpdateWithoutTeamMembersInputSchema) ]),
  create: z.union([ z.lazy(() => TeamCreateWithoutTeamMembersInputSchema),z.lazy(() => TeamUncheckedCreateWithoutTeamMembersInputSchema) ]),
  where: z.lazy(() => TeamWhereInputSchema).optional()
}).strict();

export default TeamUpsertWithoutTeamMembersInputSchema;
