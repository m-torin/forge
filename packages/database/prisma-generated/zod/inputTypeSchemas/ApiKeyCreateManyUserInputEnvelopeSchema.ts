import type { Prisma } from '../../client';

import { z } from 'zod';
import { ApiKeyCreateManyUserInputSchema } from './ApiKeyCreateManyUserInputSchema';

export const ApiKeyCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ApiKeyCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ApiKeyCreateManyUserInputSchema),
        z.lazy(() => ApiKeyCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ApiKeyCreateManyUserInputEnvelopeSchema;
