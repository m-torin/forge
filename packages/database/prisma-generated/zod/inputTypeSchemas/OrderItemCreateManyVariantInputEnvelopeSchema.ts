import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateManyVariantInputSchema } from './OrderItemCreateManyVariantInputSchema';

export const OrderItemCreateManyVariantInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyVariantInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => OrderItemCreateManyVariantInputSchema),
        z.lazy(() => OrderItemCreateManyVariantInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default OrderItemCreateManyVariantInputEnvelopeSchema;
