import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutRegistryInputSchema } from './OrderItemUpdateWithoutRegistryInputSchema';
import { OrderItemUncheckedUpdateWithoutRegistryInputSchema } from './OrderItemUncheckedUpdateWithoutRegistryInputSchema';

export const OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutRegistryInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateWithoutRegistryInputSchema),z.lazy(() => OrderItemUncheckedUpdateWithoutRegistryInputSchema) ]),
}).strict();

export default OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema;
