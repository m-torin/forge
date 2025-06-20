import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateManyProductInputSchema } from './RegistryItemCreateManyProductInputSchema';

export const RegistryItemCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.RegistryItemCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RegistryItemCreateManyProductInputSchema),z.lazy(() => RegistryItemCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RegistryItemCreateManyProductInputEnvelopeSchema;
