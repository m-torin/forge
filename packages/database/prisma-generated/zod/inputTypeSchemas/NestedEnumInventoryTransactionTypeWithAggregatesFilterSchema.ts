import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumInventoryTransactionTypeFilterSchema } from './NestedEnumInventoryTransactionTypeFilterSchema';

export const NestedEnumInventoryTransactionTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumInventoryTransactionTypeWithAggregatesFilter> =
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
          z.lazy(() => NestedEnumInventoryTransactionTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumInventoryTransactionTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumInventoryTransactionTypeFilterSchema).optional(),
    })
    .strict();

export default NestedEnumInventoryTransactionTypeWithAggregatesFilterSchema;
