import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateManyDeletedByInputSchema } from './FandomCreateManyDeletedByInputSchema';

export const FandomCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.FandomCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FandomCreateManyDeletedByInputSchema),z.lazy(() => FandomCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default FandomCreateManyDeletedByInputEnvelopeSchema;
