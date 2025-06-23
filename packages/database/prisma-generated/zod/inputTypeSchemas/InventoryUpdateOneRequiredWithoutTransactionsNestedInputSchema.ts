import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutTransactionsInputSchema } from './InventoryCreateWithoutTransactionsInputSchema';
import { InventoryUncheckedCreateWithoutTransactionsInputSchema } from './InventoryUncheckedCreateWithoutTransactionsInputSchema';
import { InventoryCreateOrConnectWithoutTransactionsInputSchema } from './InventoryCreateOrConnectWithoutTransactionsInputSchema';
import { InventoryUpsertWithoutTransactionsInputSchema } from './InventoryUpsertWithoutTransactionsInputSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateToOneWithWhereWithoutTransactionsInputSchema } from './InventoryUpdateToOneWithWhereWithoutTransactionsInputSchema';
import { InventoryUpdateWithoutTransactionsInputSchema } from './InventoryUpdateWithoutTransactionsInputSchema';
import { InventoryUncheckedUpdateWithoutTransactionsInputSchema } from './InventoryUncheckedUpdateWithoutTransactionsInputSchema';

export const InventoryUpdateOneRequiredWithoutTransactionsNestedInputSchema: z.ZodType<Prisma.InventoryUpdateOneRequiredWithoutTransactionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InventoryCreateWithoutTransactionsInputSchema),
          z.lazy(() => InventoryUncheckedCreateWithoutTransactionsInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => InventoryCreateOrConnectWithoutTransactionsInputSchema)
        .optional(),
      upsert: z.lazy(() => InventoryUpsertWithoutTransactionsInputSchema).optional(),
      connect: z.lazy(() => InventoryWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => InventoryUpdateToOneWithWhereWithoutTransactionsInputSchema),
          z.lazy(() => InventoryUpdateWithoutTransactionsInputSchema),
          z.lazy(() => InventoryUncheckedUpdateWithoutTransactionsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default InventoryUpdateOneRequiredWithoutTransactionsNestedInputSchema;
