import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';

export const InventoryTransactionUncheckedCreateInputSchema: z.ZodType<Prisma.InventoryTransactionUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  inventoryId: z.string(),
  type: z.lazy(() => InventoryTransactionTypeSchema),
  quantity: z.number().int(),
  referenceType: z.string().optional().nullable(),
  referenceId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable()
}).strict();

export default InventoryTransactionUncheckedCreateInputSchema;
