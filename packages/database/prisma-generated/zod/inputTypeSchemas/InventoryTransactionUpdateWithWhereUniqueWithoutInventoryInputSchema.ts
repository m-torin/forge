import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionWhereUniqueInputSchema } from './InventoryTransactionWhereUniqueInputSchema';
import { InventoryTransactionUpdateWithoutInventoryInputSchema } from './InventoryTransactionUpdateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema';

export const InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema: z.ZodType<Prisma.InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInput> =
  z
    .object({
      where: z.lazy(() => InventoryTransactionWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => InventoryTransactionUpdateWithoutInventoryInputSchema),
        z.lazy(() => InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema),
      ]),
    })
    .strict();

export default InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema;
