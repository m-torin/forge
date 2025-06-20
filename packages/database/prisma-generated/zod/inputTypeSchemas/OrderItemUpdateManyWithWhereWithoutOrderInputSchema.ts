import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';
import { OrderItemUpdateManyMutationInputSchema } from './OrderItemUpdateManyMutationInputSchema';
import { OrderItemUncheckedUpdateManyWithoutOrderInputSchema } from './OrderItemUncheckedUpdateManyWithoutOrderInputSchema';

export const OrderItemUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateManyMutationInputSchema),z.lazy(() => OrderItemUncheckedUpdateManyWithoutOrderInputSchema) ]),
}).strict();

export default OrderItemUpdateManyWithWhereWithoutOrderInputSchema;
