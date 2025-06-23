import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateManyProductInputSchema } from './PdpJoinCreateManyProductInputSchema';

export const PdpJoinCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.PdpJoinCreateManyProductInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => PdpJoinCreateManyProductInputSchema),
        z.lazy(() => PdpJoinCreateManyProductInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default PdpJoinCreateManyProductInputEnvelopeSchema;
