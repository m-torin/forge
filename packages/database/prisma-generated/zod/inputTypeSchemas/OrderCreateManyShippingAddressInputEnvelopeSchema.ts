import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateManyShippingAddressInputSchema } from './OrderCreateManyShippingAddressInputSchema';

export const OrderCreateManyShippingAddressInputEnvelopeSchema: z.ZodType<Prisma.OrderCreateManyShippingAddressInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => OrderCreateManyShippingAddressInputSchema),
        z.lazy(() => OrderCreateManyShippingAddressInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default OrderCreateManyShippingAddressInputEnvelopeSchema;
