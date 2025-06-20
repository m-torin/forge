import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyCategoryInputSchema } from './MediaCreateManyCategoryInputSchema';

export const MediaCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyCategoryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => MediaCreateManyCategoryInputSchema),z.lazy(() => MediaCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default MediaCreateManyCategoryInputEnvelopeSchema;
