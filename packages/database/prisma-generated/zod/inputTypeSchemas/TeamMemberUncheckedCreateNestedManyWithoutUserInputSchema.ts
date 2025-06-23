import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateWithoutUserInputSchema } from './TeamMemberCreateWithoutUserInputSchema';
import { TeamMemberUncheckedCreateWithoutUserInputSchema } from './TeamMemberUncheckedCreateWithoutUserInputSchema';
import { TeamMemberCreateOrConnectWithoutUserInputSchema } from './TeamMemberCreateOrConnectWithoutUserInputSchema';
import { TeamMemberCreateManyUserInputEnvelopeSchema } from './TeamMemberCreateManyUserInputEnvelopeSchema';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';

export const TeamMemberUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberUncheckedCreateNestedManyWithoutUserInput> =
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
      createMany: z.lazy(() => TeamMemberCreateManyUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => TeamMemberWhereUniqueInputSchema),
          z.lazy(() => TeamMemberWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default TeamMemberUncheckedCreateNestedManyWithoutUserInputSchema;
