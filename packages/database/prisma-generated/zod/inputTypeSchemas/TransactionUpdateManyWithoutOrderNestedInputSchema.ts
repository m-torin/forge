import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutOrderInputSchema } from './TransactionCreateWithoutOrderInputSchema';
import { TransactionUncheckedCreateWithoutOrderInputSchema } from './TransactionUncheckedCreateWithoutOrderInputSchema';
import { TransactionCreateOrConnectWithoutOrderInputSchema } from './TransactionCreateOrConnectWithoutOrderInputSchema';
import { TransactionUpsertWithWhereUniqueWithoutOrderInputSchema } from './TransactionUpsertWithWhereUniqueWithoutOrderInputSchema';
import { TransactionCreateManyOrderInputEnvelopeSchema } from './TransactionCreateManyOrderInputEnvelopeSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithWhereUniqueWithoutOrderInputSchema } from './TransactionUpdateWithWhereUniqueWithoutOrderInputSchema';
import { TransactionUpdateManyWithWhereWithoutOrderInputSchema } from './TransactionUpdateManyWithWhereWithoutOrderInputSchema';
import { TransactionScalarWhereInputSchema } from './TransactionScalarWhereInputSchema';

export const TransactionUpdateManyWithoutOrderNestedInputSchema: z.ZodType<Prisma.TransactionUpdateManyWithoutOrderNestedInput> = z.object({
  create: z.union([ z.lazy(() => TransactionCreateWithoutOrderInputSchema),z.lazy(() => TransactionCreateWithoutOrderInputSchema).array(),z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema),z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TransactionCreateOrConnectWithoutOrderInputSchema),z.lazy(() => TransactionCreateOrConnectWithoutOrderInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => TransactionUpsertWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => TransactionUpsertWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  createMany: z.lazy(() => TransactionCreateManyOrderInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TransactionWhereUniqueInputSchema),z.lazy(() => TransactionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => TransactionUpdateWithWhereUniqueWithoutOrderInputSchema),z.lazy(() => TransactionUpdateWithWhereUniqueWithoutOrderInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => TransactionUpdateManyWithWhereWithoutOrderInputSchema),z.lazy(() => TransactionUpdateManyWithWhereWithoutOrderInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => TransactionScalarWhereInputSchema),z.lazy(() => TransactionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default TransactionUpdateManyWithoutOrderNestedInputSchema;
