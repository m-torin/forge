import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutShippingAddressInputSchema } from './OrderUpdateWithoutShippingAddressInputSchema';
import { OrderUncheckedUpdateWithoutShippingAddressInputSchema } from './OrderUncheckedUpdateWithoutShippingAddressInputSchema';
import { OrderCreateWithoutShippingAddressInputSchema } from './OrderCreateWithoutShippingAddressInputSchema';
import { OrderUncheckedCreateWithoutShippingAddressInputSchema } from './OrderUncheckedCreateWithoutShippingAddressInputSchema';

export const OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutShippingAddressInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutShippingAddressInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutShippingAddressInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutShippingAddressInputSchema),z.lazy(() => OrderUncheckedCreateWithoutShippingAddressInputSchema) ]),
}).strict();

export default OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema;
