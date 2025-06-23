import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberScalarWhereInputSchema } from './TeamMemberScalarWhereInputSchema';
import { TeamMemberUpdateManyMutationInputSchema } from './TeamMemberUpdateManyMutationInputSchema';
import { TeamMemberUncheckedUpdateManyWithoutUserInputSchema } from './TeamMemberUncheckedUpdateManyWithoutUserInputSchema';

export const TeamMemberUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TeamMemberScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => TeamMemberUpdateManyMutationInputSchema),
        z.lazy(() => TeamMemberUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TeamMemberUpdateManyWithWhereWithoutUserInputSchema;
