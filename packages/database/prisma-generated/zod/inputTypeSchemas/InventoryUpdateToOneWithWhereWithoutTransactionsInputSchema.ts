import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';
import { InventoryUpdateWithoutTransactionsInputSchema } from './InventoryUpdateWithoutTransactionsInputSchema';
import { InventoryUncheckedUpdateWithoutTransactionsInputSchema } from './InventoryUncheckedUpdateWithoutTransactionsInputSchema';

export const InventoryUpdateToOneWithWhereWithoutTransactionsInputSchema: z.ZodType<Prisma.InventoryUpdateToOneWithWhereWithoutTransactionsInput> = z.object({
  where: z.lazy(() => InventoryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => InventoryUpdateWithoutTransactionsInputSchema),z.lazy(() => InventoryUncheckedUpdateWithoutTransactionsInputSchema) ]),
}).strict();

export default InventoryUpdateToOneWithWhereWithoutTransactionsInputSchema;
