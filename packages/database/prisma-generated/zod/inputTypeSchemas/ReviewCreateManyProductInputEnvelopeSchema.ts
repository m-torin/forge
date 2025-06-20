import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateManyProductInputSchema } from './ReviewCreateManyProductInputSchema';

export const ReviewCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ReviewCreateManyProductInputSchema),z.lazy(() => ReviewCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ReviewCreateManyProductInputEnvelopeSchema;
