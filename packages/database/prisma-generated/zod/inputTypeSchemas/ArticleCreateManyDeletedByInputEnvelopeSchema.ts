import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleCreateManyDeletedByInputSchema } from './ArticleCreateManyDeletedByInputSchema';

export const ArticleCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.ArticleCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ArticleCreateManyDeletedByInputSchema),
        z.lazy(() => ArticleCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ArticleCreateManyDeletedByInputEnvelopeSchema;
