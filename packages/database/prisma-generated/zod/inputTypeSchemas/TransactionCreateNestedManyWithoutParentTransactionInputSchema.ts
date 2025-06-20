import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutParentTransactionInputSchema } from './TransactionCreateWithoutParentTransactionInputSchema';
import { TransactionUncheckedCreateWithoutParentTransactionInputSchema } from './TransactionUncheckedCreateWithoutParentTransactionInputSchema';
import { TransactionCreateOrConnectWithoutParentTransactionInputSchema } from './TransactionCreateOrConnectWithoutParentTransactionInputSchema';
import { TransactionCreateManyParentTransactionInputEnvelopeSchema } from './TransactionCreateManyParentTransactionInputEnvelopeSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';

export const TransactionCreateNestedManyWithoutParentTransactionInputSchema: z.ZodType<Prisma.TransactionCreateNestedManyWithoutParentTransactionInput> = z.object({
  create: z.union([ z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema),z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema).array(),z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TransactionCreateOrConnectWithoutParentTransactionInputSchema),z.lazy(() => TransactionCreateOrConnectWithoutParentTransactionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TransactionCreateManyParentTransactionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TransactionCreateNestedManyWithoutParentTransactionInputSchema;
