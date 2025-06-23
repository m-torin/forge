import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateManySeriesInputSchema } from './StoryCreateManySeriesInputSchema';

export const StoryCreateManySeriesInputEnvelopeSchema: z.ZodType<Prisma.StoryCreateManySeriesInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => StoryCreateManySeriesInputSchema),
        z.lazy(() => StoryCreateManySeriesInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default StoryCreateManySeriesInputEnvelopeSchema;
