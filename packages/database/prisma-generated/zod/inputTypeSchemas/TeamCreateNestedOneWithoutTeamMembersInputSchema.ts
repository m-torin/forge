import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutTeamMembersInputSchema } from './TeamCreateWithoutTeamMembersInputSchema';
import { TeamUncheckedCreateWithoutTeamMembersInputSchema } from './TeamUncheckedCreateWithoutTeamMembersInputSchema';
import { TeamCreateOrConnectWithoutTeamMembersInputSchema } from './TeamCreateOrConnectWithoutTeamMembersInputSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';

export const TeamCreateNestedOneWithoutTeamMembersInputSchema: z.ZodType<Prisma.TeamCreateNestedOneWithoutTeamMembersInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamCreateWithoutTeamMembersInputSchema),
          z.lazy(() => TeamUncheckedCreateWithoutTeamMembersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TeamCreateOrConnectWithoutTeamMembersInputSchema).optional(),
      connect: z.lazy(() => TeamWhereUniqueInputSchema).optional(),
    })
    .strict();

export default TeamCreateNestedOneWithoutTeamMembersInputSchema;
