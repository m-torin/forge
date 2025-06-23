import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyPdpJoinInputSchema } from './MediaCreateManyPdpJoinInputSchema';

export const MediaCreateManyPdpJoinInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyPdpJoinInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyPdpJoinInputSchema),
        z.lazy(() => MediaCreateManyPdpJoinInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyPdpJoinInputEnvelopeSchema;
