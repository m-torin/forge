import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateManyFandomInputSchema } from './StoryCreateManyFandomInputSchema';

export const StoryCreateManyFandomInputEnvelopeSchema: z.ZodType<Prisma.StoryCreateManyFandomInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => StoryCreateManyFandomInputSchema),z.lazy(() => StoryCreateManyFandomInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default StoryCreateManyFandomInputEnvelopeSchema;
