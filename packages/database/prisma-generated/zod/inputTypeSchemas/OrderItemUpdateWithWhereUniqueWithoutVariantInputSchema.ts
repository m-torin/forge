import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutVariantInputSchema } from './OrderItemUpdateWithoutVariantInputSchema';
import { OrderItemUncheckedUpdateWithoutVariantInputSchema } from './OrderItemUncheckedUpdateWithoutVariantInputSchema';

export const OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutVariantInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => OrderItemUpdateWithoutVariantInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateWithoutVariantInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema;
