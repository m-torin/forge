import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionScalarWhereInputSchema } from './TransactionScalarWhereInputSchema';
import { TransactionUpdateManyMutationInputSchema } from './TransactionUpdateManyMutationInputSchema';
import { TransactionUncheckedUpdateManyWithoutParentTransactionInputSchema } from './TransactionUncheckedUpdateManyWithoutParentTransactionInputSchema';

export const TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema: z.ZodType<Prisma.TransactionUpdateManyWithWhereWithoutParentTransactionInput> =
  z
    .object({
      where: z.lazy(() => TransactionScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => TransactionUpdateManyMutationInputSchema),
        z.lazy(() => TransactionUncheckedUpdateManyWithoutParentTransactionInputSchema),
      ]),
    })
    .strict();

export default TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema;
