import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';

export const InventoryScalarRelationFilterSchema: z.ZodType<Prisma.InventoryScalarRelationFilter> = z.object({
  is: z.lazy(() => InventoryWhereInputSchema).optional(),
  isNot: z.lazy(() => InventoryWhereInputSchema).optional()
}).strict();

export default InventoryScalarRelationFilterSchema;
