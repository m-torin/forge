import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlCreateManyPdpJoinInputSchema } from './PdpUrlCreateManyPdpJoinInputSchema';

export const PdpUrlCreateManyPdpJoinInputEnvelopeSchema: z.ZodType<Prisma.PdpUrlCreateManyPdpJoinInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => PdpUrlCreateManyPdpJoinInputSchema),z.lazy(() => PdpUrlCreateManyPdpJoinInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default PdpUrlCreateManyPdpJoinInputEnvelopeSchema;
