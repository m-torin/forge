import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateManyCreatedByUserInputSchema } from './RegistryCreateManyCreatedByUserInputSchema';

export const RegistryCreateManyCreatedByUserInputEnvelopeSchema: z.ZodType<Prisma.RegistryCreateManyCreatedByUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => RegistryCreateManyCreatedByUserInputSchema),
        z.lazy(() => RegistryCreateManyCreatedByUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryCreateManyCreatedByUserInputEnvelopeSchema;
