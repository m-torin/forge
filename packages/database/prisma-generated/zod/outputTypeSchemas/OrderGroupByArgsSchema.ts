import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderWhereInputSchema } from '../inputTypeSchemas/OrderWhereInputSchema';
import { OrderOrderByWithAggregationInputSchema } from '../inputTypeSchemas/OrderOrderByWithAggregationInputSchema';
import { OrderScalarFieldEnumSchema } from '../inputTypeSchemas/OrderScalarFieldEnumSchema';
import { OrderScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/OrderScalarWhereWithAggregatesInputSchema';

export const OrderGroupByArgsSchema: z.ZodType<Prisma.OrderGroupByArgs> = z
  .object({
    where: OrderWhereInputSchema.optional(),
    orderBy: z
      .union([
        OrderOrderByWithAggregationInputSchema.array(),
        OrderOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: OrderScalarFieldEnumSchema.array(),
    having: OrderScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default OrderGroupByArgsSchema;
