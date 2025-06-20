import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateManyDeletedByInputSchema } from './SeriesCreateManyDeletedByInputSchema';

export const SeriesCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.SeriesCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => SeriesCreateManyDeletedByInputSchema),z.lazy(() => SeriesCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default SeriesCreateManyDeletedByInputEnvelopeSchema;
