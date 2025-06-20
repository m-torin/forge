import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutItemsInputSchema } from './OrderCreateWithoutItemsInputSchema';
import { OrderUncheckedCreateWithoutItemsInputSchema } from './OrderUncheckedCreateWithoutItemsInputSchema';
import { OrderCreateOrConnectWithoutItemsInputSchema } from './OrderCreateOrConnectWithoutItemsInputSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';

export const OrderCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutItemsInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => OrderWhereUniqueInputSchema).optional()
}).strict();

export default OrderCreateNestedOneWithoutItemsInputSchema;
