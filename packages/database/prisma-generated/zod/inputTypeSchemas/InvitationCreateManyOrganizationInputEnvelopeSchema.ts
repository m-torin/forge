import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateManyOrganizationInputSchema } from './InvitationCreateManyOrganizationInputSchema';

export const InvitationCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.InvitationCreateManyOrganizationInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => InvitationCreateManyOrganizationInputSchema),
        z.lazy(() => InvitationCreateManyOrganizationInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default InvitationCreateManyOrganizationInputEnvelopeSchema;
