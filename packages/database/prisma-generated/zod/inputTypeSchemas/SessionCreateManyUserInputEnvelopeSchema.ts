import type { Prisma } from '../../client';

import { z } from 'zod';
import { SessionCreateManyUserInputSchema } from './SessionCreateManyUserInputSchema';

export const SessionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.SessionCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => SessionCreateManyUserInputSchema),
        z.lazy(() => SessionCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default SessionCreateManyUserInputEnvelopeSchema;
