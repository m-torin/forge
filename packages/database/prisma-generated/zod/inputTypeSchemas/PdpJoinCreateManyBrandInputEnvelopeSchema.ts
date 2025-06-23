import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateManyBrandInputSchema } from './PdpJoinCreateManyBrandInputSchema';

export const PdpJoinCreateManyBrandInputEnvelopeSchema: z.ZodType<Prisma.PdpJoinCreateManyBrandInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => PdpJoinCreateManyBrandInputSchema),
        z.lazy(() => PdpJoinCreateManyBrandInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default PdpJoinCreateManyBrandInputEnvelopeSchema;
