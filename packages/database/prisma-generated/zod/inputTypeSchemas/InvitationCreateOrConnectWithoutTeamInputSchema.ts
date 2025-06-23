import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationWhereUniqueInputSchema } from './InvitationWhereUniqueInputSchema';
import { InvitationCreateWithoutTeamInputSchema } from './InvitationCreateWithoutTeamInputSchema';
import { InvitationUncheckedCreateWithoutTeamInputSchema } from './InvitationUncheckedCreateWithoutTeamInputSchema';

export const InvitationCreateOrConnectWithoutTeamInputSchema: z.ZodType<Prisma.InvitationCreateOrConnectWithoutTeamInput> =
  z
    .object({
      where: z.lazy(() => InvitationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InvitationCreateWithoutTeamInputSchema),
        z.lazy(() => InvitationUncheckedCreateWithoutTeamInputSchema),
      ]),
    })
    .strict();

export default InvitationCreateOrConnectWithoutTeamInputSchema;
