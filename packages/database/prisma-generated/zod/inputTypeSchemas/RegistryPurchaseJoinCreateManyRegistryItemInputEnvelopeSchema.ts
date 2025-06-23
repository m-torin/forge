import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateManyRegistryItemInputSchema } from './RegistryPurchaseJoinCreateManyRegistryItemInputSchema';

export const RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateManyRegistryItemInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => RegistryPurchaseJoinCreateManyRegistryItemInputSchema),
        z.lazy(() => RegistryPurchaseJoinCreateManyRegistryItemInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema;
