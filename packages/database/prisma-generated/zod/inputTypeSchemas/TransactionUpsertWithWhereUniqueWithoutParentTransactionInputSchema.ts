import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithoutParentTransactionInputSchema } from './TransactionUpdateWithoutParentTransactionInputSchema';
import { TransactionUncheckedUpdateWithoutParentTransactionInputSchema } from './TransactionUncheckedUpdateWithoutParentTransactionInputSchema';
import { TransactionCreateWithoutParentTransactionInputSchema } from './TransactionCreateWithoutParentTransactionInputSchema';
import { TransactionUncheckedCreateWithoutParentTransactionInputSchema } from './TransactionUncheckedCreateWithoutParentTransactionInputSchema';

export const TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema: z.ZodType<Prisma.TransactionUpsertWithWhereUniqueWithoutParentTransactionInput> =
  z
    .object({
      where: z.lazy(() => TransactionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TransactionUpdateWithoutParentTransactionInputSchema),
        z.lazy(() => TransactionUncheckedUpdateWithoutParentTransactionInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema),
        z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema),
      ]),
    })
    .strict();

export default TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema;
