import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateManyTeamInputSchema } from './TeamMemberCreateManyTeamInputSchema';

export const TeamMemberCreateManyTeamInputEnvelopeSchema: z.ZodType<Prisma.TeamMemberCreateManyTeamInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => TeamMemberCreateManyTeamInputSchema),
        z.lazy(() => TeamMemberCreateManyTeamInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TeamMemberCreateManyTeamInputEnvelopeSchema;
