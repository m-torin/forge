import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateManyRegistryInputSchema } from './RegistryItemCreateManyRegistryInputSchema';

export const RegistryItemCreateManyRegistryInputEnvelopeSchema: z.ZodType<Prisma.RegistryItemCreateManyRegistryInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => RegistryItemCreateManyRegistryInputSchema),
        z.lazy(() => RegistryItemCreateManyRegistryInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryItemCreateManyRegistryInputEnvelopeSchema;
