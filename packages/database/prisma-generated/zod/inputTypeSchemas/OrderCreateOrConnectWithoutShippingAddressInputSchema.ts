import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderCreateWithoutShippingAddressInputSchema } from './OrderCreateWithoutShippingAddressInputSchema';
import { OrderUncheckedCreateWithoutShippingAddressInputSchema } from './OrderUncheckedCreateWithoutShippingAddressInputSchema';

export const OrderCreateOrConnectWithoutShippingAddressInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutShippingAddressInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutShippingAddressInputSchema),z.lazy(() => OrderUncheckedCreateWithoutShippingAddressInputSchema) ]),
}).strict();

export default OrderCreateOrConnectWithoutShippingAddressInputSchema;
