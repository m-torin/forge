import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutBillingAddressInputSchema } from './OrderCreateWithoutBillingAddressInputSchema';
import { OrderUncheckedCreateWithoutBillingAddressInputSchema } from './OrderUncheckedCreateWithoutBillingAddressInputSchema';
import { OrderCreateOrConnectWithoutBillingAddressInputSchema } from './OrderCreateOrConnectWithoutBillingAddressInputSchema';
import { OrderCreateManyBillingAddressInputEnvelopeSchema } from './OrderCreateManyBillingAddressInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';

export const OrderUncheckedCreateNestedManyWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutBillingAddressInput> = z.object({
  create: z.union([ z.lazy(() => OrderCreateWithoutBillingAddressInputSchema),z.lazy(() => OrderCreateWithoutBillingAddressInputSchema).array(),z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema),z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderCreateOrConnectWithoutBillingAddressInputSchema),z.lazy(() => OrderCreateOrConnectWithoutBillingAddressInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderCreateManyBillingAddressInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => OrderWhereUniqueInputSchema),z.lazy(() => OrderWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default OrderUncheckedCreateNestedManyWithoutBillingAddressInputSchema;
