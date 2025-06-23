import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateWithoutTeamInputSchema } from './TeamMemberCreateWithoutTeamInputSchema';
import { TeamMemberUncheckedCreateWithoutTeamInputSchema } from './TeamMemberUncheckedCreateWithoutTeamInputSchema';
import { TeamMemberCreateOrConnectWithoutTeamInputSchema } from './TeamMemberCreateOrConnectWithoutTeamInputSchema';
import { TeamMemberCreateManyTeamInputEnvelopeSchema } from './TeamMemberCreateManyTeamInputEnvelopeSchema';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';

export const TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberUncheckedCreateNestedManyWithoutTeamInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamMemberCreateWithoutTeamInputSchema),
          z.lazy(() => TeamMemberCreateWithoutTeamInputSchema).array(),
          z.lazy(() => TeamMemberUncheckedCreateWithoutTeamInputSchema),
          z.lazy(() => TeamMemberUncheckedCreateWithoutTeamInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => TeamMemberCreateOrConnectWithoutTeamInputSchema),
          z.lazy(() => TeamMemberCreateOrConnectWithoutTeamInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => TeamMemberCreateManyTeamInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TeamMemberUncheckedCreateNestedManyWithoutTeamInputSchema;
