import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutOrderInputSchema } from './OrderItemUpdateWithoutOrderInputSchema';
import { OrderItemUncheckedUpdateWithoutOrderInputSchema } from './OrderItemUncheckedUpdateWithoutOrderInputSchema';
import { OrderItemCreateWithoutOrderInputSchema } from './OrderItemCreateWithoutOrderInputSchema';
import { OrderItemUncheckedCreateWithoutOrderInputSchema } from './OrderItemUncheckedCreateWithoutOrderInputSchema';

export const OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutOrderInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => OrderItemUpdateWithoutOrderInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateWithoutOrderInputSchema),
      ]),
      create: z.union([
        z.lazy(() => OrderItemCreateWithoutOrderInputSchema),
        z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpsertWithWhereUniqueWithoutOrderInputSchema;
