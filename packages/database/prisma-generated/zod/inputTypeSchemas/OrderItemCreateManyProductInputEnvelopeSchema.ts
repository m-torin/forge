import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateManyProductInputSchema } from './OrderItemCreateManyProductInputSchema';

export const OrderItemCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderItemCreateManyProductInputSchema),z.lazy(() => OrderItemCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default OrderItemCreateManyProductInputEnvelopeSchema;
