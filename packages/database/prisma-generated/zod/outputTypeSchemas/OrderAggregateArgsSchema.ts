import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderWhereInputSchema } from '../inputTypeSchemas/OrderWhereInputSchema'
import { OrderOrderByWithRelationInputSchema } from '../inputTypeSchemas/OrderOrderByWithRelationInputSchema'
import { OrderWhereUniqueInputSchema } from '../inputTypeSchemas/OrderWhereUniqueInputSchema'

export const OrderAggregateArgsSchema: z.ZodType<Prisma.OrderAggregateArgs> = z.object({
  where: OrderWhereInputSchema.optional(),
  orderBy: z.union([ OrderOrderByWithRelationInputSchema.array(),OrderOrderByWithRelationInputSchema ]).optional(),
  cursor: OrderWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default OrderAggregateArgsSchema;
