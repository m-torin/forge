import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithoutParentTransactionInputSchema } from './TransactionUpdateWithoutParentTransactionInputSchema';
import { TransactionUncheckedUpdateWithoutParentTransactionInputSchema } from './TransactionUncheckedUpdateWithoutParentTransactionInputSchema';

export const TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema: z.ZodType<Prisma.TransactionUpdateWithWhereUniqueWithoutParentTransactionInput> = z.object({
  where: z.lazy(() => TransactionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TransactionUpdateWithoutParentTransactionInputSchema),z.lazy(() => TransactionUncheckedUpdateWithoutParentTransactionInputSchema) ]),
}).strict();

export default TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema;
