import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutOrderInputSchema } from './OrderItemCreateWithoutOrderInputSchema';
import { OrderItemUncheckedCreateWithoutOrderInputSchema } from './OrderItemUncheckedCreateWithoutOrderInputSchema';
import { OrderItemCreateOrConnectWithoutOrderInputSchema } from './OrderItemCreateOrConnectWithoutOrderInputSchema';
import { OrderItemCreateManyOrderInputEnvelopeSchema } from './OrderItemCreateManyOrderInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';

export const OrderItemCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema),z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default OrderItemCreateNestedManyWithoutOrderInputSchema;
