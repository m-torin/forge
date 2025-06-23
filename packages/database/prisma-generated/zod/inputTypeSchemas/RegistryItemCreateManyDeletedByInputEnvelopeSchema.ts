import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateManyDeletedByInputSchema } from './RegistryItemCreateManyDeletedByInputSchema';

export const RegistryItemCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.RegistryItemCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => RegistryItemCreateManyDeletedByInputSchema),
        z.lazy(() => RegistryItemCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryItemCreateManyDeletedByInputEnvelopeSchema;
