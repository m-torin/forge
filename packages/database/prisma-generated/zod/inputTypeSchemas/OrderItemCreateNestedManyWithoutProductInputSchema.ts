import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutProductInputSchema } from './OrderItemCreateWithoutProductInputSchema';
import { OrderItemUncheckedCreateWithoutProductInputSchema } from './OrderItemUncheckedCreateWithoutProductInputSchema';
import { OrderItemCreateOrConnectWithoutProductInputSchema } from './OrderItemCreateOrConnectWithoutProductInputSchema';
import { OrderItemCreateManyProductInputEnvelopeSchema } from './OrderItemCreateManyProductInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';

export const OrderItemCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.OrderItemCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductInputSchema),z.lazy(() => OrderItemCreateWithoutProductInputSchema).array(),z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutProductInputSchema),z.lazy(() => OrderItemCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default OrderItemCreateNestedManyWithoutProductInputSchema;
