import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateWithoutUserInputSchema } from './TeamMemberCreateWithoutUserInputSchema';
import { TeamMemberUncheckedCreateWithoutUserInputSchema } from './TeamMemberUncheckedCreateWithoutUserInputSchema';
import { TeamMemberCreateOrConnectWithoutUserInputSchema } from './TeamMemberCreateOrConnectWithoutUserInputSchema';
import { TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema } from './TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema';
import { TeamMemberCreateManyUserInputEnvelopeSchema } from './TeamMemberCreateManyUserInputEnvelopeSchema';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema } from './TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema';
import { TeamMemberUpdateManyWithWhereWithoutUserInputSchema } from './TeamMemberUpdateManyWithWhereWithoutUserInputSchema';
import { TeamMemberScalarWhereInputSchema } from './TeamMemberScalarWhereInputSchema';

export const TeamMemberUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.TeamMemberUncheckedUpdateManyWithoutUserNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TeamMemberCreateWithoutUserInputSchema),
          z.lazy(() => TeamMemberCreateWithoutUserInputSchema).array(),
          z.lazy(() => TeamMemberUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => TeamMemberUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => TeamMemberCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => TeamMemberCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => TeamMemberCreateManyUserInputEnvelopeSchema).optional(),
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
          z.lazy(() => TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => TeamMemberUpdateManyWithWhereWithoutUserInputSchema),
          z.lazy(() => TeamMemberUpdateManyWithWhereWithoutUserInputSchema).array(),
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

export default TeamMemberUncheckedUpdateManyWithoutUserNestedInputSchema;
