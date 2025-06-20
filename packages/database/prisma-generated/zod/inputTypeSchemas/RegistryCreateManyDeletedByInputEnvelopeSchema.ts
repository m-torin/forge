import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateManyDeletedByInputSchema } from './RegistryCreateManyDeletedByInputSchema';

export const RegistryCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.RegistryCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RegistryCreateManyDeletedByInputSchema),z.lazy(() => RegistryCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RegistryCreateManyDeletedByInputEnvelopeSchema;
