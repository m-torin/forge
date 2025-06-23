import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionWhereInputSchema } from './InventoryTransactionWhereInputSchema';

export const InventoryTransactionListRelationFilterSchema: z.ZodType<Prisma.InventoryTransactionListRelationFilter> =
  z
    .object({
      every: z.lazy(() => InventoryTransactionWhereInputSchema).optional(),
      some: z.lazy(() => InventoryTransactionWhereInputSchema).optional(),
      none: z.lazy(() => InventoryTransactionWhereInputSchema).optional(),
    })
    .strict();

export default InventoryTransactionListRelationFilterSchema;
