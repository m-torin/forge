import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionUpdateWithoutRefundsInputSchema } from './TransactionUpdateWithoutRefundsInputSchema';
import { TransactionUncheckedUpdateWithoutRefundsInputSchema } from './TransactionUncheckedUpdateWithoutRefundsInputSchema';
import { TransactionCreateWithoutRefundsInputSchema } from './TransactionCreateWithoutRefundsInputSchema';
import { TransactionUncheckedCreateWithoutRefundsInputSchema } from './TransactionUncheckedCreateWithoutRefundsInputSchema';
import { TransactionWhereInputSchema } from './TransactionWhereInputSchema';

export const TransactionUpsertWithoutRefundsInputSchema: z.ZodType<Prisma.TransactionUpsertWithoutRefundsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => TransactionUpdateWithoutRefundsInputSchema),
        z.lazy(() => TransactionUncheckedUpdateWithoutRefundsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TransactionCreateWithoutRefundsInputSchema),
        z.lazy(() => TransactionUncheckedCreateWithoutRefundsInputSchema),
      ]),
      where: z.lazy(() => TransactionWhereInputSchema).optional(),
    })
    .strict();

export default TransactionUpsertWithoutRefundsInputSchema;
