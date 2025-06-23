import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateWithoutTeamInputSchema } from './TeamMemberCreateWithoutTeamInputSchema';
import { TeamMemberUncheckedCreateWithoutTeamInputSchema } from './TeamMemberUncheckedCreateWithoutTeamInputSchema';
import { TeamMemberCreateOrConnectWithoutTeamInputSchema } from './TeamMemberCreateOrConnectWithoutTeamInputSchema';
import { TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema } from './TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema';
import { TeamMemberCreateManyTeamInputEnvelopeSchema } from './TeamMemberCreateManyTeamInputEnvelopeSchema';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema } from './TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema';
import { TeamMemberUpdateManyWithWhereWithoutTeamInputSchema } from './TeamMemberUpdateManyWithWhereWithoutTeamInputSchema';
import { TeamMemberScalarWhereInputSchema } from './TeamMemberScalarWhereInputSchema';

export const TeamMemberUncheckedUpdateManyWithoutTeamNestedInputSchema: z.ZodType<Prisma.TeamMemberUncheckedUpdateManyWithoutTeamNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema),
          z.lazy(() => TeamMemberUpsertWithWhereUniqueWithoutTeamInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => TeamMemberCreateManyTeamInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema),
          z.lazy(() => TeamMemberUpdateWithWhereUniqueWithoutTeamInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => TeamMemberUpdateManyWithWhereWithoutTeamInputSchema),
          z.lazy(() => TeamMemberUpdateManyWithWhereWithoutTeamInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => TeamMemberScalarWhereInputSchema),
          z.lazy(() => TeamMemberScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TeamMemberUncheckedUpdateManyWithoutTeamNestedInputSchema;
