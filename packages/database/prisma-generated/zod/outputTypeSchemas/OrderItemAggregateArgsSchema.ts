import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemWhereInputSchema } from '../inputTypeSchemas/OrderItemWhereInputSchema'
import { OrderItemOrderByWithRelationInputSchema } from '../inputTypeSchemas/OrderItemOrderByWithRelationInputSchema'
import { OrderItemWhereUniqueInputSchema } from '../inputTypeSchemas/OrderItemWhereUniqueInputSchema'

export const OrderItemAggregateArgsSchema: z.ZodType<Prisma.OrderItemAggregateArgs> = z.object({
  where: OrderItemWhereInputSchema.optional(),
  orderBy: z.union([ OrderItemOrderByWithRelationInputSchema.array(),OrderItemOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderItemWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default OrderItemAggregateArgsSchema;
