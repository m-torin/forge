import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateManyDeletedByInputSchema } from './CollectionCreateManyDeletedByInputSchema';

export const CollectionCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.CollectionCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CollectionCreateManyDeletedByInputSchema),z.lazy(() => CollectionCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CollectionCreateManyDeletedByInputEnvelopeSchema;
