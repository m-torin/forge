import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutParentTransactionInputSchema } from './TransactionCreateWithoutParentTransactionInputSchema';
import { TransactionUncheckedCreateWithoutParentTransactionInputSchema } from './TransactionUncheckedCreateWithoutParentTransactionInputSchema';
import { TransactionCreateOrConnectWithoutParentTransactionInputSchema } from './TransactionCreateOrConnectWithoutParentTransactionInputSchema';
import { TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema } from './TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema';
import { TransactionCreateManyParentTransactionInputEnvelopeSchema } from './TransactionCreateManyParentTransactionInputEnvelopeSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema } from './TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema';
import { TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema } from './TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema';
import { TransactionScalarWhereInputSchema } from './TransactionScalarWhereInputSchema';

export const TransactionUpdateManyWithoutParentTransactionNestedInputSchema: z.ZodType<Prisma.TransactionUpdateManyWithoutParentTransactionNestedInput> = z.object({
  create: z.union([ z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema),z.lazy(() => TransactionCreateWithoutParentTransactionInputSchema).array(),z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutParentTransactionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TransactionCreateOrConnectWithoutParentTransactionInputSchema),z.lazy(() => TransactionCreateOrConnectWithoutParentTransactionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema),z.lazy(() => TransactionUpsertWithWhereUniqueWithoutParentTransactionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TransactionCreateManyParentTransactionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema),z.lazy(() => TransactionUpdateWithWhereUniqueWithoutParentTransactionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema),z.lazy(() => TransactionUpdateManyWithWhereWithoutParentTransactionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TransactionScalarWhereInputSchema),z.lazy(() => TransactionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TransactionUpdateManyWithoutParentTransactionNestedInputSchema;
