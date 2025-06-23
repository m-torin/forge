import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyUserInputSchema } from './MediaCreateManyUserInputSchema';

export const MediaCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyUserInputSchema),
        z.lazy(() => MediaCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyUserInputEnvelopeSchema;
