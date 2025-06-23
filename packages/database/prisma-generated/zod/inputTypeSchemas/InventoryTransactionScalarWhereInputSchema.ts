import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumInventoryTransactionTypeFilterSchema } from './EnumInventoryTransactionTypeFilterSchema';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const InventoryTransactionScalarWhereInputSchema: z.ZodType<Prisma.InventoryTransactionScalarWhereInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => InventoryTransactionScalarWhereInputSchema),
          z.lazy(() => InventoryTransactionScalarWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => InventoryTransactionScalarWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => InventoryTransactionScalarWhereInputSchema),
          z.lazy(() => InventoryTransactionScalarWhereInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      inventoryId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      type: z
        .union([
          z.lazy(() => EnumInventoryTransactionTypeFilterSchema),
          z.lazy(() => InventoryTransactionTypeSchema),
        ])
        .optional(),
      quantity: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
      referenceType: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      referenceId: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      notes: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      createdBy: z
        .union([z.lazy(() => StringNullableFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default InventoryTransactionScalarWhereInputSchema;
