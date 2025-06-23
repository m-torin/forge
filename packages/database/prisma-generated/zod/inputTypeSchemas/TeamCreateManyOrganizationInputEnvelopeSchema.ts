import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamCreateManyOrganizationInputSchema } from './TeamCreateManyOrganizationInputSchema';

export const TeamCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.TeamCreateManyOrganizationInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => TeamCreateManyOrganizationInputSchema),
        z.lazy(() => TeamCreateManyOrganizationInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TeamCreateManyOrganizationInputEnvelopeSchema;
