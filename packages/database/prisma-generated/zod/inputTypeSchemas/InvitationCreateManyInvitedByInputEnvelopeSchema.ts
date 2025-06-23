import type { Prisma } from '../../client';

import { z } from 'zod';
import { InvitationCreateManyInvitedByInputSchema } from './InvitationCreateManyInvitedByInputSchema';

export const InvitationCreateManyInvitedByInputEnvelopeSchema: z.ZodType<Prisma.InvitationCreateManyInvitedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => InvitationCreateManyInvitedByInputSchema),
        z.lazy(() => InvitationCreateManyInvitedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default InvitationCreateManyInvitedByInputEnvelopeSchema;
