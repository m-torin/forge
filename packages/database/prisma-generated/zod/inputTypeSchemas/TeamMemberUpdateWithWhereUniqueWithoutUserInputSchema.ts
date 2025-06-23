import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereUniqueInputSchema } from './TeamMemberWhereUniqueInputSchema';
import { TeamMemberUpdateWithoutUserInputSchema } from './TeamMemberUpdateWithoutUserInputSchema';
import { TeamMemberUncheckedUpdateWithoutUserInputSchema } from './TeamMemberUncheckedUpdateWithoutUserInputSchema';

export const TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => TeamMemberUpdateWithoutUserInputSchema),
        z.lazy(() => TeamMemberUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TeamMemberUpdateWithWhereUniqueWithoutUserInputSchema;
