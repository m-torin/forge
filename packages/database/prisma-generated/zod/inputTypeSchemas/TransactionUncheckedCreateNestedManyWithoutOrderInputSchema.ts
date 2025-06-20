import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutOrderInputSchema } from './TransactionCreateWithoutOrderInputSchema';
import { TransactionUncheckedCreateWithoutOrderInputSchema } from './TransactionUncheckedCreateWithoutOrderInputSchema';
import { TransactionCreateOrConnectWithoutOrderInputSchema } from './TransactionCreateOrConnectWithoutOrderInputSchema';
import { TransactionCreateManyOrderInputEnvelopeSchema } from './TransactionCreateManyOrderInputEnvelopeSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';

export const TransactionUncheckedCreateNestedManyWithoutOrderInputSchema: z.ZodType<Prisma.TransactionUncheckedCreateNestedManyWithoutOrderInput> = z.object({
  create: z.union([ z.lazy(() => TransactionCreateWithoutOrderInputSchema),z.lazy(() => TransactionCreateWithoutOrderInputSchema).array(),z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TransactionCreateOrConnectWithoutOrderInputSchema),z.lazy(() => TransactionCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TransactionCreateManyOrderInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TransactionUncheckedCreateNestedManyWithoutOrderInputSchema;
