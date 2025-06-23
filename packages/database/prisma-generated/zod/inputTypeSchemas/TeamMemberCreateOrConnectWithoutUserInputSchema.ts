import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberCreateWithoutUserInputSchema } from './TeamMemberCreateWithoutUserInputSchema';
import { TeamMemberUncheckedCreateWithoutUserInputSchema } from './TeamMemberUncheckedCreateWithoutUserInputSchema';

export const TeamMemberCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TeamMemberCreateWithoutUserInputSchema),
        z.lazy(() => TeamMemberUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TeamMemberCreateOrConnectWithoutUserInputSchema;
