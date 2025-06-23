import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderCreateWithoutUserInputSchema } from './OrderCreateWithoutUserInputSchema';
import { OrderUncheckedCreateWithoutUserInputSchema } from './OrderUncheckedCreateWithoutUserInputSchema';

export const OrderCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => OrderWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => OrderCreateWithoutUserInputSchema),
        z.lazy(() => OrderUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default OrderCreateOrConnectWithoutUserInputSchema;
