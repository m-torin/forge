import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateManyCollectionInputSchema } from './RegistryItemCreateManyCollectionInputSchema';

export const RegistryItemCreateManyCollectionInputEnvelopeSchema: z.ZodType<Prisma.RegistryItemCreateManyCollectionInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => RegistryItemCreateManyCollectionInputSchema),
        z.lazy(() => RegistryItemCreateManyCollectionInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryItemCreateManyCollectionInputEnvelopeSchema;
