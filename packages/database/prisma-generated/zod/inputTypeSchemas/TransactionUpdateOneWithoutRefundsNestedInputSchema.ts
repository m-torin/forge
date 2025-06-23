import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateWithoutRefundsInputSchema } from './TransactionCreateWithoutRefundsInputSchema';
import { TransactionUncheckedCreateWithoutRefundsInputSchema } from './TransactionUncheckedCreateWithoutRefundsInputSchema';
import { TransactionCreateOrConnectWithoutRefundsInputSchema } from './TransactionCreateOrConnectWithoutRefundsInputSchema';
import { TransactionUpsertWithoutRefundsInputSchema } from './TransactionUpsertWithoutRefundsInputSchema';
import { TransactionWhereInputSchema } from './TransactionWhereInputSchema';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateToOneWithWhereWithoutRefundsInputSchema } from './TransactionUpdateToOneWithWhereWithoutRefundsInputSchema';
import { TransactionUpdateWithoutRefundsInputSchema } from './TransactionUpdateWithoutRefundsInputSchema';
import { TransactionUncheckedUpdateWithoutRefundsInputSchema } from './TransactionUncheckedUpdateWithoutRefundsInputSchema';

export const TransactionUpdateOneWithoutRefundsNestedInputSchema: z.ZodType<Prisma.TransactionUpdateOneWithoutRefundsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => TransactionCreateWithoutRefundsInputSchema),
          z.lazy(() => TransactionUncheckedCreateWithoutRefundsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => TransactionCreateOrConnectWithoutRefundsInputSchema).optional(),
      upsert: z.lazy(() => TransactionUpsertWithoutRefundsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => TransactionWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => TransactionWhereInputSchema)]).optional(),
      connect: z.lazy(() => TransactionWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => TransactionUpdateToOneWithWhereWithoutRefundsInputSchema),
          z.lazy(() => TransactionUpdateWithoutRefundsInputSchema),
          z.lazy(() => TransactionUncheckedUpdateWithoutRefundsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default TransactionUpdateOneWithoutRefundsNestedInputSchema;
