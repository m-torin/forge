import { z } from 'zod';
import { InventoryTransactionTypeSchema } from '../inputTypeSchemas/InventoryTransactionTypeSchema';

/////////////////////////////////////////
// INVENTORY TRANSACTION SCHEMA
/////////////////////////////////////////

export const InventoryTransactionSchema = z.object({
  type: InventoryTransactionTypeSchema,
  id: z.string().cuid(),
  inventoryId: z.string(),
  quantity: z.number().int(),
  referenceType: z.string().nullable(),
  referenceId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});

export type InventoryTransaction = z.infer<typeof InventoryTransactionSchema>;

export default InventoryTransactionSchema;
