import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';
import { OrderItemUpdateManyMutationInputSchema } from './OrderItemUpdateManyMutationInputSchema';
import { OrderItemUncheckedUpdateManyWithoutProductInputSchema } from './OrderItemUncheckedUpdateManyWithoutProductInputSchema';

export const OrderItemUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => OrderItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateManyMutationInputSchema),z.lazy(() => OrderItemUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export default OrderItemUpdateManyWithWhereWithoutProductInputSchema;
