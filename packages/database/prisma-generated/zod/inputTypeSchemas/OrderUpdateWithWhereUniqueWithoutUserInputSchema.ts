import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithoutUserInputSchema } from './OrderUpdateWithoutUserInputSchema';
import { OrderUncheckedUpdateWithoutUserInputSchema } from './OrderUncheckedUpdateWithoutUserInputSchema';

export const OrderUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.OrderUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => OrderWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => OrderUpdateWithoutUserInputSchema),
        z.lazy(() => OrderUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default OrderUpdateWithWhereUniqueWithoutUserInputSchema;
