import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryCreateWithoutTransactionsInputSchema } from './InventoryCreateWithoutTransactionsInputSchema';
import { InventoryUncheckedCreateWithoutTransactionsInputSchema } from './InventoryUncheckedCreateWithoutTransactionsInputSchema';

export const InventoryCreateOrConnectWithoutTransactionsInputSchema: z.ZodType<Prisma.InventoryCreateOrConnectWithoutTransactionsInput> =
  z
    .object({
      where: z.lazy(() => InventoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InventoryCreateWithoutTransactionsInputSchema),
        z.lazy(() => InventoryUncheckedCreateWithoutTransactionsInputSchema),
      ]),
    })
    .strict();

export default InventoryCreateOrConnectWithoutTransactionsInputSchema;
