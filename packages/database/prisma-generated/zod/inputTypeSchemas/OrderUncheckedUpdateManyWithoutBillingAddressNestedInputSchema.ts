import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutBillingAddressInputSchema } from './OrderCreateWithoutBillingAddressInputSchema';
import { OrderUncheckedCreateWithoutBillingAddressInputSchema } from './OrderUncheckedCreateWithoutBillingAddressInputSchema';
import { OrderCreateOrConnectWithoutBillingAddressInputSchema } from './OrderCreateOrConnectWithoutBillingAddressInputSchema';
import { OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema } from './OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema';
import { OrderCreateManyBillingAddressInputEnvelopeSchema } from './OrderCreateManyBillingAddressInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema } from './OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema';
import { OrderUpdateManyWithWhereWithoutBillingAddressInputSchema } from './OrderUpdateManyWithWhereWithoutBillingAddressInputSchema';
import { OrderScalarWhereInputSchema } from './OrderScalarWhereInputSchema';

export const OrderUncheckedUpdateManyWithoutBillingAddressNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutBillingAddressNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutBillingAddressInputSchema),z.lazy(() => OrderCreateWithoutBillingAddressInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema),z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutBillingAddressInputSchema),z.lazy(() => OrderCreateOrConnectWithoutBillingAddressInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema),z.lazy(() => OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyBillingAddressInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema),z.lazy(() => OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderUpdateManyWithWhereWithoutBillingAddressInputSchema),z.lazy(() => OrderUpdateManyWithWhereWithoutBillingAddressInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderScalarWhereInputSchema),z.lazy(() => OrderScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default OrderUncheckedUpdateManyWithoutBillingAddressNestedInputSchema;
