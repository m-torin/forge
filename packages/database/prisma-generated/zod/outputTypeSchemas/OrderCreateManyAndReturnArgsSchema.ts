import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderCreateManyInputSchema } from '../inputTypeSchemas/OrderCreateManyInputSchema'

export const OrderCreateManyAndReturnArgsSchema: z.ZodType<Prisma.OrderCreateManyAndReturnArgs> = z.object({
  data: z.union([ OrderCreateManyInputSchema,OrderCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default OrderCreateManyAndReturnArgsSchema;
