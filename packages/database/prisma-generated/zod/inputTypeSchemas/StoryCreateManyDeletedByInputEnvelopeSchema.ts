import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateManyDeletedByInputSchema } from './StoryCreateManyDeletedByInputSchema';

export const StoryCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.StoryCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => StoryCreateManyDeletedByInputSchema),
        z.lazy(() => StoryCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default StoryCreateManyDeletedByInputEnvelopeSchema;
