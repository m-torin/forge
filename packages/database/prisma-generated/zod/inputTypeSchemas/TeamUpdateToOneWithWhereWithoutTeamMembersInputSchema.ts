import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';
import { TeamUpdateWithoutTeamMembersInputSchema } from './TeamUpdateWithoutTeamMembersInputSchema';
import { TeamUncheckedUpdateWithoutTeamMembersInputSchema } from './TeamUncheckedUpdateWithoutTeamMembersInputSchema';

export const TeamUpdateToOneWithWhereWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamUpdateToOneWithWhereWithoutTeamMembersInput> =
  z
    .object({
      where: z.lazy(() => TeamWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => TeamUpdateWithoutTeamMembersInputSchema),
        z.lazy(() => TeamUncheckedUpdateWithoutTeamMembersInputSchema),
      ]),
    })
    .strict();

export default TeamUpdateToOneWithWhereWithoutTeamMembersInputSchema;
