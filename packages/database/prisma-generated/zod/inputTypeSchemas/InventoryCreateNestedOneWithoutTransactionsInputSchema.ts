import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutTransactionsInputSchema } from './InventoryCreateWithoutTransactionsInputSchema';
import { InventoryUncheckedCreateWithoutTransactionsInputSchema } from './InventoryUncheckedCreateWithoutTransactionsInputSchema';
import { InventoryCreateOrConnectWithoutTransactionsInputSchema } from './InventoryCreateOrConnectWithoutTransactionsInputSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';

export const InventoryCreateNestedOneWithoutTransactionsInputSchema: z.ZodType<Prisma.InventoryCreateNestedOneWithoutTransactionsInput> =
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
      connect: z.lazy(() => InventoryWhereUniqueInputSchema).optional(),
    })
    .strict();

export default InventoryCreateNestedOneWithoutTransactionsInputSchema;
