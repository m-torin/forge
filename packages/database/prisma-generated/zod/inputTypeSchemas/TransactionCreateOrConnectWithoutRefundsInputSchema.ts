import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionCreateWithoutRefundsInputSchema } from './TransactionCreateWithoutRefundsInputSchema';
import { TransactionUncheckedCreateWithoutRefundsInputSchema } from './TransactionUncheckedCreateWithoutRefundsInputSchema';

export const TransactionCreateOrConnectWithoutRefundsInputSchema: z.ZodType<Prisma.TransactionCreateOrConnectWithoutRefundsInput> = z.object({
  where: z.lazy(() => TransactionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TransactionCreateWithoutRefundsInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutRefundsInputSchema) ]),
}).strict();

export default TransactionCreateOrConnectWithoutRefundsInputSchema;
