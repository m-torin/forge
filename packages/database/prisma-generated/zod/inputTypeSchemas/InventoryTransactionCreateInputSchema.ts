import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';
import { InventoryCreateNestedOneWithoutTransactionsInputSchema } from './InventoryCreateNestedOneWithoutTransactionsInputSchema';

export const InventoryTransactionCreateInputSchema: z.ZodType<Prisma.InventoryTransactionCreateInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      type: z.lazy(() => InventoryTransactionTypeSchema),
      quantity: z.number().int(),
      referenceType: z.string().optional().nullable(),
      referenceId: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      createdBy: z.string().optional().nullable(),
      inventory: z.lazy(() => InventoryCreateNestedOneWithoutTransactionsInputSchema),
    })
    .strict();

export default InventoryTransactionCreateInputSchema;
