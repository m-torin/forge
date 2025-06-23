import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyArticleInputSchema } from './MediaCreateManyArticleInputSchema';

export const MediaCreateManyArticleInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyArticleInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyArticleInputSchema),
        z.lazy(() => MediaCreateManyArticleInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyArticleInputEnvelopeSchema;
