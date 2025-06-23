import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutShippingAddressInputSchema } from './OrderUpdateWithoutShippingAddressInputSchema';
import { OrderUncheckedUpdateWithoutShippingAddressInputSchema } from './OrderUncheckedUpdateWithoutShippingAddressInputSchema';

export const OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutShippingAddressInput> =
  z
    .object({
      where: z.lazy(() => OrderWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => OrderUpdateWithoutShippingAddressInputSchema),
        z.lazy(() => OrderUncheckedUpdateWithoutShippingAddressInputSchema),
      ]),
    })
    .strict();

export default OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema;
