import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutOrderInputSchema } from './OrderItemCreateWithoutOrderInputSchema';
import { OrderItemUncheckedCreateWithoutOrderInputSchema } from './OrderItemUncheckedCreateWithoutOrderInputSchema';
import { OrderItemCreateOrConnectWithoutOrderInputSchema } from './OrderItemCreateOrConnectWithoutOrderInputSchema';
import { OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema } from './OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema';
import { OrderItemCreateManyOrderInputEnvelopeSchema } from './OrderItemCreateManyOrderInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema } from './OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema';
import { OrderItemUpdateManyWithWhereWithoutOrderInputSchema } from './OrderItemUpdateManyWithWhereWithoutOrderInputSchema';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';

export const OrderItemUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema),z.lazy(() => OrderItemCreateWithoutOrderInputSchema).array(),z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema),z.lazy(() => OrderItemCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => OrderItemUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema),z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default OrderItemUpdateManyWithoutOrderNestedInputSchema;
