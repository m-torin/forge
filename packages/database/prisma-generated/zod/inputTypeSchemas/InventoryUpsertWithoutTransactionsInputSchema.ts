import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryUpdateWithoutTransactionsInputSchema } from './InventoryUpdateWithoutTransactionsInputSchema';
import { InventoryUncheckedUpdateWithoutTransactionsInputSchema } from './InventoryUncheckedUpdateWithoutTransactionsInputSchema';
import { InventoryCreateWithoutTransactionsInputSchema } from './InventoryCreateWithoutTransactionsInputSchema';
import { InventoryUncheckedCreateWithoutTransactionsInputSchema } from './InventoryUncheckedCreateWithoutTransactionsInputSchema';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';

export const InventoryUpsertWithoutTransactionsInputSchema: z.ZodType<Prisma.InventoryUpsertWithoutTransactionsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => InventoryUpdateWithoutTransactionsInputSchema),
        z.lazy(() => InventoryUncheckedUpdateWithoutTransactionsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => InventoryCreateWithoutTransactionsInputSchema),
        z.lazy(() => InventoryUncheckedCreateWithoutTransactionsInputSchema),
      ]),
      where: z.lazy(() => InventoryWhereInputSchema).optional(),
    })
    .strict();

export default InventoryUpsertWithoutTransactionsInputSchema;
