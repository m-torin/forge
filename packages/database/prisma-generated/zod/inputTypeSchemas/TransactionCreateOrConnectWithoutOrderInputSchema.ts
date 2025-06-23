import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionCreateWithoutOrderInputSchema } from './TransactionCreateWithoutOrderInputSchema';
import { TransactionUncheckedCreateWithoutOrderInputSchema } from './TransactionUncheckedCreateWithoutOrderInputSchema';

export const TransactionCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.TransactionCreateOrConnectWithoutOrderInput> =
  z
    .object({
      where: z.lazy(() => TransactionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TransactionCreateWithoutOrderInputSchema),
        z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema),
      ]),
    })
    .strict();

export default TransactionCreateOrConnectWithoutOrderInputSchema;
