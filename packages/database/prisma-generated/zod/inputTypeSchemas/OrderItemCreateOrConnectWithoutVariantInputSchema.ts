import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemCreateWithoutVariantInputSchema } from './OrderItemCreateWithoutVariantInputSchema';
import { OrderItemUncheckedCreateWithoutVariantInputSchema } from './OrderItemUncheckedCreateWithoutVariantInputSchema';

export const OrderItemCreateOrConnectWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutVariantInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutVariantInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema) ]),
}).strict();

export default OrderItemCreateOrConnectWithoutVariantInputSchema;
