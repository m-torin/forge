import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutBillingAddressInputSchema } from './OrderUpdateWithoutBillingAddressInputSchema';
import { OrderUncheckedUpdateWithoutBillingAddressInputSchema } from './OrderUncheckedUpdateWithoutBillingAddressInputSchema';

export const OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutBillingAddressInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderUpdateWithoutBillingAddressInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutBillingAddressInputSchema) ]),
}).strict();

export default OrderUpdateWithWhereUniqueWithoutBillingAddressInputSchema;
