import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';
import { OrderItemUpdateManyMutationInputSchema } from './OrderItemUpdateManyMutationInputSchema';
import { OrderItemUncheckedUpdateManyWithoutRegistryInputSchema } from './OrderItemUncheckedUpdateManyWithoutRegistryInputSchema';

export const OrderItemUpdateManyWithWhereWithoutRegistryInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => OrderItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => OrderItemUpdateManyMutationInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateManyWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpdateManyWithWhereWithoutRegistryInputSchema;
