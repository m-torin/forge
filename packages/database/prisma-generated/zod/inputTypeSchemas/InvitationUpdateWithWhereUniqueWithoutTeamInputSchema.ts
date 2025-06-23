import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationUpdateWithoutTeamInputSchema } from './InvitationUpdateWithoutTeamInputSchema';
import { InvitationUncheckedUpdateWithoutTeamInputSchema } from './InvitationUncheckedUpdateWithoutTeamInputSchema';

export const InvitationUpdateWithWhereUniqueWithoutTeamInputSchema: z.ZodType<Prisma.InvitationUpdateWithWhereUniqueWithoutTeamInput> =
  z
    .object({
      where: z.lazy(() => InvitationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => InvitationUpdateWithoutTeamInputSchema),
        z.lazy(() => InvitationUncheckedUpdateWithoutTeamInputSchema),
      ]),
    })
    .strict();

export default InvitationUpdateWithWhereUniqueWithoutTeamInputSchema;
