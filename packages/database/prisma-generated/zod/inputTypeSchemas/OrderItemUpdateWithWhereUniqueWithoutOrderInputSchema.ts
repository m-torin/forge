import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutOrderInputSchema } from './OrderItemUpdateWithoutOrderInputSchema';
import { OrderItemUncheckedUpdateWithoutOrderInputSchema } from './OrderItemUncheckedUpdateWithoutOrderInputSchema';

export const OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutOrderInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => OrderItemUpdateWithoutOrderInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateWithoutOrderInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpdateWithWhereUniqueWithoutOrderInputSchema;
