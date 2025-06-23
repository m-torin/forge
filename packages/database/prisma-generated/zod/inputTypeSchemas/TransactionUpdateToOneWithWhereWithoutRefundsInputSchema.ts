import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereInputSchema } from './TransactionWhereInputSchema';
import { TransactionUpdateWithoutRefundsInputSchema } from './TransactionUpdateWithoutRefundsInputSchema';
import { TransactionUncheckedUpdateWithoutRefundsInputSchema } from './TransactionUncheckedUpdateWithoutRefundsInputSchema';

export const TransactionUpdateToOneWithWhereWithoutRefundsInputSchema: z.ZodType<Prisma.TransactionUpdateToOneWithWhereWithoutRefundsInput> =
  z
    .object({
      where: z.lazy(() => TransactionWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => TransactionUpdateWithoutRefundsInputSchema),
        z.lazy(() => TransactionUncheckedUpdateWithoutRefundsInputSchema),
      ]),
    })
    .strict();

export default TransactionUpdateToOneWithWhereWithoutRefundsInputSchema;
