import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionScalarWhereInputSchema } from './InventoryTransactionScalarWhereInputSchema';
import { InventoryTransactionUpdateManyMutationInputSchema } from './InventoryTransactionUpdateManyMutationInputSchema';
import { InventoryTransactionUncheckedUpdateManyWithoutInventoryInputSchema } from './InventoryTransactionUncheckedUpdateManyWithoutInventoryInputSchema';

export const InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema: z.ZodType<Prisma.InventoryTransactionUpdateManyWithWhereWithoutInventoryInput> =
  z
    .object({
      where: z.lazy(() => InventoryTransactionScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => InventoryTransactionUpdateManyMutationInputSchema),
        z.lazy(() => InventoryTransactionUncheckedUpdateManyWithoutInventoryInputSchema),
      ]),
    })
    .strict();

export default InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema;
