import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderScalarWhereInputSchema } from './OrderScalarWhereInputSchema';
import { OrderUpdateManyMutationInputSchema } from './OrderUpdateManyMutationInputSchema';
import { OrderUncheckedUpdateManyWithoutBillingAddressInputSchema } from './OrderUncheckedUpdateManyWithoutBillingAddressInputSchema';

export const OrderUpdateManyWithWhereWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderUpdateManyWithWhereWithoutBillingAddressInput> =
  z
    .object({
      where: z.lazy(() => OrderScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => OrderUpdateManyMutationInputSchema),
        z.lazy(() => OrderUncheckedUpdateManyWithoutBillingAddressInputSchema),
      ]),
    })
    .strict();

export default OrderUpdateManyWithWhereWithoutBillingAddressInputSchema;
