import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionCreateWithoutParentTransactionInputSchema } from './TransactionCreateWithoutParentTransactionInputSchema';
import { TransactionUncheckedCreateWithoutParentTransactionInputSchema } from './TransactionUncheckedCreateWithoutParentTransactionInputSchema';

export const TransactionCreateOrConnectWithoutParentTransactionInputSchema: z.ZodType<Prisma.TransactionCreateOrConnectWithoutParentTransactionInput> =
  z
    .object({
      where: z.lazy(() => TransactionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema),
        z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema),
      ]),
    })
    .strict();

export default TransactionCreateOrConnectWithoutParentTransactionInputSchema;
