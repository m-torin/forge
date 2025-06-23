import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateWithoutTeamMembersInputSchema } from './TeamCreateWithoutTeamMembersInputSchema';
import { TeamUncheckedCreateWithoutTeamMembersInputSchema } from './TeamUncheckedCreateWithoutTeamMembersInputSchema';
import { TeamCreateOrConnectWithoutTeamMembersInputSchema } from './TeamCreateOrConnectWithoutTeamMembersInputSchema';
import { TeamUpsertWithoutTeamMembersInputSchema } from './TeamUpsertWithoutTeamMembersInputSchema';
import { TeamWhereUniqueInputSchema } from './TeamWhereUniqueInputSchema';
import { TeamUpdateToOneWithWhereWithoutTeamMembersInputSchema } from './TeamUpdateToOneWithWhereWithoutTeamMembersInputSchema';
import { TeamUpdateWithoutTeamMembersInputSchema } from './TeamUpdateWithoutTeamMembersInputSchema';
import { TeamUncheckedUpdateWithoutTeamMembersInputSchema } from './TeamUncheckedUpdateWithoutTeamMembersInputSchema';

export const TeamUpdateOneRequiredWithoutTeamMembersNestedInputSchema: z.ZodType<Prisma.TeamUpdateOneRequiredWithoutTeamMembersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamCreateWithoutTeamMembersInputSchema),
          z.lazy(() => TeamUncheckedCreateWithoutTeamMembersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TeamCreateOrConnectWithoutTeamMembersInputSchema).optional(),
      upsert: z.lazy(() => TeamUpsertWithoutTeamMembersInputSchema).optional(),
      connect: z.lazy(() => TeamWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => TeamUpdateToOneWithWhereWithoutTeamMembersInputSchema),
          z.lazy(() => TeamUpdateWithoutTeamMembersInputSchema),
          z.lazy(() => TeamUncheckedUpdateWithoutTeamMembersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default TeamUpdateOneRequiredWithoutTeamMembersNestedInputSchema;
