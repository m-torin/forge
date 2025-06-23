import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionWhereUniqueInputSchema } from './InventoryTransactionWhereUniqueInputSchema';
import { InventoryTransactionCreateWithoutInventoryInputSchema } from './InventoryTransactionCreateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedCreateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedCreateWithoutInventoryInputSchema';

export const InventoryTransactionCreateOrConnectWithoutInventoryInputSchema: z.ZodType<Prisma.InventoryTransactionCreateOrConnectWithoutInventoryInput> =
  z
    .object({
      where: z.lazy(() => InventoryTransactionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema),
        z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema),
      ]),
    })
    .strict();

export default InventoryTransactionCreateOrConnectWithoutInventoryInputSchema;
