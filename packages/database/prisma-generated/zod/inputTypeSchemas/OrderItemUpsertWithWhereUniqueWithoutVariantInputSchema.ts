import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutVariantInputSchema } from './OrderItemUpdateWithoutVariantInputSchema';
import { OrderItemUncheckedUpdateWithoutVariantInputSchema } from './OrderItemUncheckedUpdateWithoutVariantInputSchema';
import { OrderItemCreateWithoutVariantInputSchema } from './OrderItemCreateWithoutVariantInputSchema';
import { OrderItemUncheckedCreateWithoutVariantInputSchema } from './OrderItemUncheckedCreateWithoutVariantInputSchema';

export const OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutVariantInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => OrderItemUpdateWithoutVariantInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateWithoutVariantInputSchema),
      ]),
      create: z.union([
        z.lazy(() => OrderItemCreateWithoutVariantInputSchema),
        z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema;
