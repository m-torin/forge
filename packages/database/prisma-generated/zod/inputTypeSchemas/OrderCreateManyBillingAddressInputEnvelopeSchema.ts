import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateManyBillingAddressInputSchema } from './OrderCreateManyBillingAddressInputSchema';

export const OrderCreateManyBillingAddressInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyBillingAddressInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderCreateManyBillingAddressInputSchema),z.lazy(() => OrderCreateManyBillingAddressInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default OrderCreateManyBillingAddressInputEnvelopeSchema;
