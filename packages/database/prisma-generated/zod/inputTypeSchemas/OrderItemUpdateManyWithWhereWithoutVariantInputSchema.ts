import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';
import { OrderItemUpdateManyMutationInputSchema } from './OrderItemUpdateManyMutationInputSchema';
import { OrderItemUncheckedUpdateManyWithoutVariantInputSchema } from './OrderItemUncheckedUpdateManyWithoutVariantInputSchema';

export const OrderItemUpdateManyWithWhereWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithWhereWithoutVariantInput> = z.object({
  where: z.lazy(() => OrderItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateManyMutationInputSchema),z.lazy(() => OrderItemUncheckedUpdateManyWithoutVariantInputSchema) ]),
}).strict();

export default OrderItemUpdateManyWithWhereWithoutVariantInputSchema;
