import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateManyPurchaserInputSchema } from './RegistryPurchaseJoinCreateManyPurchaserInputSchema';

export const RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateManyPurchaserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => RegistryPurchaseJoinCreateManyPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinCreateManyPurchaserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema;
