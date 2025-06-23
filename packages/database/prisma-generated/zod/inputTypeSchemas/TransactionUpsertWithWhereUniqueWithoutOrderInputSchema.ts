import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithoutOrderInputSchema } from './TransactionUpdateWithoutOrderInputSchema';
import { TransactionUncheckedUpdateWithoutOrderInputSchema } from './TransactionUncheckedUpdateWithoutOrderInputSchema';
import { TransactionCreateWithoutOrderInputSchema } from './TransactionCreateWithoutOrderInputSchema';
import { TransactionUncheckedCreateWithoutOrderInputSchema } from './TransactionUncheckedCreateWithoutOrderInputSchema';

export const TransactionUpsertWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.TransactionUpsertWithWhereUniqueWithoutOrderInput> =
  z
    .object({
      where: z.lazy(() => TransactionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => TransactionUpdateWithoutOrderInputSchema),
        z.lazy(() => TransactionUncheckedUpdateWithoutOrderInputSchema),
      ]),
      create: z.union([
        z.lazy(() => TransactionCreateWithoutOrderInputSchema),
        z.lazy(() => TransactionUncheckedCreateWithoutOrderInputSchema),
      ]),
    })
    .strict();

export default TransactionUpsertWithWhereUniqueWithoutOrderInputSchema;
