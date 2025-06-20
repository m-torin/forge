import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionWhereUniqueInputSchema } from './InventoryTransactionWhereUniqueInputSchema';
import { InventoryTransactionUpdateWithoutInventoryInputSchema } from './InventoryTransactionUpdateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema';
import { InventoryTransactionCreateWithoutInventoryInputSchema } from './InventoryTransactionCreateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedCreateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedCreateWithoutInventoryInputSchema';

export const InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema: z.ZodType<Prisma.InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInput> = z.object({
  where: z.lazy(() => InventoryTransactionWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InventoryTransactionUpdateWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUncheckedUpdateWithoutInventoryInputSchema) ]),
  create: z.union([ z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema) ]),
}).strict();

export default InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema;
