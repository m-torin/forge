import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyProductInputSchema } from './MediaCreateManyProductInputSchema';

export const MediaCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MediaCreateManyProductInputSchema),z.lazy(() => MediaCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MediaCreateManyProductInputEnvelopeSchema;
