import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { NestedEnumInventoryTransactionTypeFilterSchema } from './NestedEnumInventoryTransactionTypeFilterSchema';

export const EnumInventoryTransactionTypeFilterSchema: z.ZodType<Prisma.EnumInventoryTransactionTypeFilter> =
  z
    .object({
      equals: z.lazy(() => InventoryTransactionTypeSchema).optional(),
      in: z
        .lazy(() => InventoryTransactionTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => InventoryTransactionTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => InventoryTransactionTypeSchema),
          z.lazy(() => NestedEnumInventoryTransactionTypeFilterSchema),
        ])
        .optional(),
    })
    .strict();

export default EnumInventoryTransactionTypeFilterSchema;
