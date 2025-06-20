import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateManyDeletedByInputSchema } from './LocationCreateManyDeletedByInputSchema';

export const LocationCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.LocationCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => LocationCreateManyDeletedByInputSchema),z.lazy(() => LocationCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default LocationCreateManyDeletedByInputEnvelopeSchema;
