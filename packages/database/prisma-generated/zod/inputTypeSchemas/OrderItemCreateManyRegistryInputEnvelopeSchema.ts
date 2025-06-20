import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateManyRegistryInputSchema } from './OrderItemCreateManyRegistryInputSchema';

export const OrderItemCreateManyRegistryInputEnvelopeSchema: z.ZodType<Prisma.OrderItemCreateManyRegistryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => OrderItemCreateManyRegistryInputSchema),z.lazy(() => OrderItemCreateManyRegistryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default OrderItemCreateManyRegistryInputEnvelopeSchema;
