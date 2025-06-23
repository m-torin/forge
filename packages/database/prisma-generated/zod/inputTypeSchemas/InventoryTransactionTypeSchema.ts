import { z } from 'zod';

export const InventoryTransactionTypeSchema = z.enum([
  'RESTOCK',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'RESERVATION',
  'RELEASE',
]);

export type InventoryTransactionTypeType = `${z.infer<typeof InventoryTransactionTypeSchema>}`;

export default InventoryTransactionTypeSchema;
