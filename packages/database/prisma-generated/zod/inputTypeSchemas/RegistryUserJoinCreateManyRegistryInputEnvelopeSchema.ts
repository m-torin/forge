import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateManyRegistryInputSchema } from './RegistryUserJoinCreateManyRegistryInputSchema';

export const RegistryUserJoinCreateManyRegistryInputEnvelopeSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyRegistryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RegistryUserJoinCreateManyRegistryInputSchema),z.lazy(() => RegistryUserJoinCreateManyRegistryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RegistryUserJoinCreateManyRegistryInputEnvelopeSchema;
