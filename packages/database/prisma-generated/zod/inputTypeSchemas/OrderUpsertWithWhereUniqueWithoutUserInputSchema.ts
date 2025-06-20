import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutUserInputSchema } from './OrderUpdateWithoutUserInputSchema';
import { OrderUncheckedUpdateWithoutUserInputSchema } from './OrderUncheckedUpdateWithoutUserInputSchema';
import { OrderCreateWithoutUserInputSchema } from './OrderCreateWithoutUserInputSchema';
import { OrderUncheckedCreateWithoutUserInputSchema } from './OrderUncheckedCreateWithoutUserInputSchema';

export const OrderUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderUpdateWithoutUserInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutUserInputSchema),z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default OrderUpsertWithWhereUniqueWithoutUserInputSchema;
