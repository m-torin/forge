import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithoutUserInputSchema } from './TeamMemberUpdateWithoutUserInputSchema';
import { TeamMemberUncheckedUpdateWithoutUserInputSchema } from './TeamMemberUncheckedUpdateWithoutUserInputSchema';
import { TeamMemberCreateWithoutUserInputSchema } from './TeamMemberCreateWithoutUserInputSchema';
import { TeamMemberUncheckedCreateWithoutUserInputSchema } from './TeamMemberUncheckedCreateWithoutUserInputSchema';

export const TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TeamMemberUpdateWithoutUserInputSchema),
        z.lazy(() => TeamMemberUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TeamMemberCreateWithoutUserInputSchema),
        z.lazy(() => TeamMemberUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TeamMemberUpsertWithWhereUniqueWithoutUserInputSchema;
