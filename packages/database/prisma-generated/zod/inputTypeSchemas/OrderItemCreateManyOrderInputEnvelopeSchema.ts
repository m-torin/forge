import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateManyOrderInputSchema } from './OrderItemCreateManyOrderInputSchema';

export const OrderItemCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyOrderInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderItemCreateManyOrderInputSchema),z.lazy(() => OrderItemCreateManyOrderInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default OrderItemCreateManyOrderInputEnvelopeSchema;
