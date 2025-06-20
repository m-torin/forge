import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutUserInputSchema } from './OrderCreateWithoutUserInputSchema';
import { OrderUncheckedCreateWithoutUserInputSchema } from './OrderUncheckedCreateWithoutUserInputSchema';
import { OrderCreateOrConnectWithoutUserInputSchema } from './OrderCreateOrConnectWithoutUserInputSchema';
import { OrderUpsertWithWhereUniqueWithoutUserInputSchema } from './OrderUpsertWithWhereUniqueWithoutUserInputSchema';
import { OrderCreateManyUserInputEnvelopeSchema } from './OrderCreateManyUserInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithWhereUniqueWithoutUserInputSchema } from './OrderUpdateWithWhereUniqueWithoutUserInputSchema';
import { OrderUpdateManyWithWhereWithoutUserInputSchema } from './OrderUpdateManyWithWhereWithoutUserInputSchema';
import { OrderScalarWhereInputSchema } from './OrderScalarWhereInputSchema';

export const OrderUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderCreateWithoutUserInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema),z.lazy(() => OrderCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default OrderUncheckedUpdateManyWithoutUserNestedInputSchema;
