import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamUpdateWithoutInvitationsInputSchema } from './TeamUpdateWithoutInvitationsInputSchema';
import { TeamUncheckedUpdateWithoutInvitationsInputSchema } from './TeamUncheckedUpdateWithoutInvitationsInputSchema';
import { TeamCreateWithoutInvitationsInputSchema } from './TeamCreateWithoutInvitationsInputSchema';
import { TeamUncheckedCreateWithoutInvitationsInputSchema } from './TeamUncheckedCreateWithoutInvitationsInputSchema';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamUpsertWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamUpsertWithoutInvitationsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => TeamUpdateWithoutInvitationsInputSchema),
        z.lazy(() => TeamUncheckedUpdateWithoutInvitationsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TeamCreateWithoutInvitationsInputSchema),
        z.lazy(() => TeamUncheckedCreateWithoutInvitationsInputSchema),
      ]),
      where: z.lazy(() => TeamWhereInputSchema).optional(),
    })
    .strict();

export default TeamUpsertWithoutInvitationsInputSchema;
