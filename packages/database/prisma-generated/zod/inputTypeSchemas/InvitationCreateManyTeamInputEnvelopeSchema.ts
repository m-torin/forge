import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateManyTeamInputSchema } from './InvitationCreateManyTeamInputSchema';

export const InvitationCreateManyTeamInputEnvelopeSchema: z.ZodType<Prisma.InvitationCreateManyTeamInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => InvitationCreateManyTeamInputSchema),
        z.lazy(() => InvitationCreateManyTeamInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default InvitationCreateManyTeamInputEnvelopeSchema;
