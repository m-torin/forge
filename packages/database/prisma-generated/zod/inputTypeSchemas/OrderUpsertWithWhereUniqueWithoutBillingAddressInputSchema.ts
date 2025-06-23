import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutBillingAddressInputSchema } from './OrderUpdateWithoutBillingAddressInputSchema';
import { OrderUncheckedUpdateWithoutBillingAddressInputSchema } from './OrderUncheckedUpdateWithoutBillingAddressInputSchema';
import { OrderCreateWithoutBillingAddressInputSchema } from './OrderCreateWithoutBillingAddressInputSchema';
import { OrderUncheckedCreateWithoutBillingAddressInputSchema } from './OrderUncheckedCreateWithoutBillingAddressInputSchema';

export const OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutBillingAddressInput> =
  z
    .object({
      where: z.lazy(() => OrderWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => OrderUpdateWithoutBillingAddressInputSchema),
        z.lazy(() => OrderUncheckedUpdateWithoutBillingAddressInputSchema),
      ]),
      create: z.union([
        z.lazy(() => OrderCreateWithoutBillingAddressInputSchema),
        z.lazy(() => OrderUncheckedCreateWithoutBillingAddressInputSchema),
      ]),
    })
    .strict();

export default OrderUpsertWithWhereUniqueWithoutBillingAddressInputSchema;
