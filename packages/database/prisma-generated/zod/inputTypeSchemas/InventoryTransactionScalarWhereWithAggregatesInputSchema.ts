import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumInventoryTransactionTypeWithAggregatesFilterSchema } from './EnumInventoryTransactionTypeWithAggregatesFilterSchema';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const InventoryTransactionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.InventoryTransactionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => InventoryTransactionScalarWhereWithAggregatesInputSchema),z.lazy(() => InventoryTransactionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => InventoryTransactionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InventoryTransactionScalarWhereWithAggregatesInputSchema),z.lazy(() => InventoryTransactionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  inventoryId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumInventoryTransactionTypeWithAggregatesFilterSchema),z.lazy(() => InventoryTransactionTypeSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  referenceType: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  referenceId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default InventoryTransactionScalarWhereWithAggregatesInputSchema;
