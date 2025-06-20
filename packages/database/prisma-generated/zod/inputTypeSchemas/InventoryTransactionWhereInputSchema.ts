import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumInventoryTransactionTypeFilterSchema } from './EnumInventoryTransactionTypeFilterSchema';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { InventoryScalarRelationFilterSchema } from './InventoryScalarRelationFilterSchema';
import { InventoryWhereInputSchema } from './InventoryWhereInputSchema';

export const InventoryTransactionWhereInputSchema: z.ZodType<Prisma.InventoryTransactionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => InventoryTransactionWhereInputSchema),z.lazy(() => InventoryTransactionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => InventoryTransactionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => InventoryTransactionWhereInputSchema),z.lazy(() => InventoryTransactionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  inventoryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => EnumInventoryTransactionTypeFilterSchema),z.lazy(() => InventoryTransactionTypeSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  referenceType: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  referenceId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  createdBy: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  inventory: z.union([ z.lazy(() => InventoryScalarRelationFilterSchema),z.lazy(() => InventoryWhereInputSchema) ]).optional(),
}).strict();

export default InventoryTransactionWhereInputSchema;
