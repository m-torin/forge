import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateManyDeletedByInputSchema } from './CastCreateManyDeletedByInputSchema';

export const CastCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.CastCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CastCreateManyDeletedByInputSchema),z.lazy(() => CastCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CastCreateManyDeletedByInputEnvelopeSchema;
