import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemWhereInputSchema } from '../inputTypeSchemas/OrderItemWhereInputSchema';

export const OrderItemDeleteManyArgsSchema: z.ZodType<Prisma.OrderItemDeleteManyArgs> = z
  .object({
    where: OrderItemWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default OrderItemDeleteManyArgsSchema;
