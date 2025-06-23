import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemUpdateManyMutationInputSchema } from '../inputTypeSchemas/OrderItemUpdateManyMutationInputSchema';
import { OrderItemUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/OrderItemUncheckedUpdateManyInputSchema';
import { OrderItemWhereInputSchema } from '../inputTypeSchemas/OrderItemWhereInputSchema';

export const OrderItemUpdateManyArgsSchema: z.ZodType<Prisma.OrderItemUpdateManyArgs> = z
  .object({
    data: z.union([
      OrderItemUpdateManyMutationInputSchema,
      OrderItemUncheckedUpdateManyInputSchema,
    ]),
    where: OrderItemWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default OrderItemUpdateManyArgsSchema;
