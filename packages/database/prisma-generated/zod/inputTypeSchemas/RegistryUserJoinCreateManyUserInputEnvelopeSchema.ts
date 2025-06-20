import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateManyUserInputSchema } from './RegistryUserJoinCreateManyUserInputSchema';

export const RegistryUserJoinCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RegistryUserJoinCreateManyUserInputSchema),z.lazy(() => RegistryUserJoinCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RegistryUserJoinCreateManyUserInputEnvelopeSchema;
