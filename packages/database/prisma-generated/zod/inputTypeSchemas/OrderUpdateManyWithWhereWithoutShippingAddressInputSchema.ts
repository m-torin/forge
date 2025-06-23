import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderScalarWhereInputSchema } from './OrderScalarWhereInputSchema';
import { OrderUpdateManyMutationInputSchema } from './OrderUpdateManyMutationInputSchema';
import { OrderUncheckedUpdateManyWithoutShippingAddressInputSchema } from './OrderUncheckedUpdateManyWithoutShippingAddressInputSchema';

export const OrderUpdateManyWithWhereWithoutShippingAddressInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutShippingAddressInput> =
  z
    .object({
      where: z.lazy(() => OrderScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => OrderUpdateManyMutationInputSchema),
        z.lazy(() => OrderUncheckedUpdateManyWithoutShippingAddressInputSchema),
      ]),
    })
    .strict();

export default OrderUpdateManyWithWhereWithoutShippingAddressInputSchema;
