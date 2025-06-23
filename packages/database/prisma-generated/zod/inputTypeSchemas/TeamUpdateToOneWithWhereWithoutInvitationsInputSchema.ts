import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';
import { TeamUpdateWithoutInvitationsInputSchema } from './TeamUpdateWithoutInvitationsInputSchema';
import { TeamUncheckedUpdateWithoutInvitationsInputSchema } from './TeamUncheckedUpdateWithoutInvitationsInputSchema';

export const TeamUpdateToOneWithWhereWithoutInvitationsInputSchema: z.ZodType<Prisma.TeamUpdateToOneWithWhereWithoutInvitationsInput> =
  z
    .object({
      where: z.lazy(() => TeamWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => TeamUpdateWithoutInvitationsInputSchema),
        z.lazy(() => TeamUncheckedUpdateWithoutInvitationsInputSchema),
      ]),
    })
    .strict();

export default TeamUpdateToOneWithWhereWithoutInvitationsInputSchema;
