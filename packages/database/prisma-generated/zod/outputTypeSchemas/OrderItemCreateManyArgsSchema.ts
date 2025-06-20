import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemCreateManyInputSchema } from '../inputTypeSchemas/OrderItemCreateManyInputSchema'

export const OrderItemCreateManyArgsSchema: z.ZodType<Prisma.OrderItemCreateManyArgs> = z.object({
  data: z.union([ OrderItemCreateManyInputSchema,OrderItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default OrderItemCreateManyArgsSchema;
