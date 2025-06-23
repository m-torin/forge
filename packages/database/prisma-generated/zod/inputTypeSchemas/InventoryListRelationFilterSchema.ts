import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';

export const InventoryListRelationFilterSchema: z.ZodType<Prisma.InventoryListRelationFilter> = z
  .object({
    every: z.lazy(() => InventoryWhereInputSchema).optional(),
    some: z.lazy(() => InventoryWhereInputSchema).optional(),
    none: z.lazy(() => InventoryWhereInputSchema).optional(),
  })
  .strict();

export default InventoryListRelationFilterSchema;
