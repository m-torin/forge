import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemWhereInputSchema } from '../inputTypeSchemas/OrderItemWhereInputSchema'
import { OrderItemOrderByWithAggregationInputSchema } from '../inputTypeSchemas/OrderItemOrderByWithAggregationInputSchema'
import { OrderItemScalarFieldEnumSchema } from '../inputTypeSchemas/OrderItemScalarFieldEnumSchema'
import { OrderItemScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/OrderItemScalarWhereWithAggregatesInputSchema'

export const OrderItemGroupByArgsSchema: z.ZodType<Prisma.OrderItemGroupByArgs> = z.object({
  where: OrderItemWhereInputSchema.optional(),
  orderBy: z.union([ OrderItemOrderByWithAggregationInputSchema.array(),OrderItemOrderByWithAggregationInputSchema ]).optional(),
  by: OrderItemScalarFieldEnumSchema.array(),
  having: OrderItemScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default OrderItemGroupByArgsSchema;
