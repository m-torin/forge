import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberCreateManyUserInputSchema } from './TeamMemberCreateManyUserInputSchema';

export const TeamMemberCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.TeamMemberCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => TeamMemberCreateManyUserInputSchema),
        z.lazy(() => TeamMemberCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TeamMemberCreateManyUserInputEnvelopeSchema;
