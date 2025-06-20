import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderCreateManyInputSchema } from '../inputTypeSchemas/OrderCreateManyInputSchema'

export const OrderCreateManyArgsSchema: z.ZodType<Prisma.OrderCreateManyArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema,OrderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default OrderCreateManyArgsSchema;
