import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyBrandInputSchema } from './MediaCreateManyBrandInputSchema';

export const MediaCreateManyBrandInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyBrandInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MediaCreateManyBrandInputSchema),z.lazy(() => MediaCreateManyBrandInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MediaCreateManyBrandInputEnvelopeSchema;
