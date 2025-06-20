import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderCreateWithoutBillingAddressInputSchema } from './OrderCreateWithoutBillingAddressInputSchema';
import { OrderUncheckedCreateWithoutBillingAddressInputSchema } from './OrderUncheckedCreateWithoutBillingAddressInputSchema';

export const OrderCreateOrConnectWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutBillingAddressInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutBillingAddressInputSchema),z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema) ]),
}).strict();

export default OrderCreateOrConnectWithoutBillingAddressInputSchema;
