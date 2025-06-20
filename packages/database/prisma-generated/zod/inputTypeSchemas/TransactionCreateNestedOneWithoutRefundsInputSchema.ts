import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutRefundsInputSchema } from './TransactionCreateWithoutRefundsInputSchema';
import { TransactionUncheckedCreateWithoutRefundsInputSchema } from './TransactionUncheckedCreateWithoutRefundsInputSchema';
import { TransactionCreateOrConnectWithoutRefundsInputSchema } from './TransactionCreateOrConnectWithoutRefundsInputSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';

export const TransactionCreateNestedOneWithoutRefundsInputSchema: z.ZodType<Prisma.TransactionCreateNestedOneWithoutRefundsInput> = z.object({
  create: z.union([ z.lazy(() => TransactionCreateWithoutRefundsInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutRefundsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TransactionCreateOrConnectWithoutRefundsInputSchema).optional(),
  connect: z.lazy(() => TransactionWhereUniqueInputSchema).optional()
}).strict();

export default TransactionCreateNestedOneWithoutRefundsInputSchema;
