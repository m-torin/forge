import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberCreateManyOrganizationInputSchema } from './MemberCreateManyOrganizationInputSchema';

export const MemberCreateManyOrganizationInputEnvelopeSchema: z.ZodType<Prisma.MemberCreateManyOrganizationInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MemberCreateManyOrganizationInputSchema),
        z.lazy(() => MemberCreateManyOrganizationInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MemberCreateManyOrganizationInputEnvelopeSchema;
