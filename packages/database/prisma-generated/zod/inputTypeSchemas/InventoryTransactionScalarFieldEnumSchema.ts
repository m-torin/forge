import { z } from 'zod';

export const InventoryTransactionScalarFieldEnumSchema = z.enum([
  'id',
  'inventoryId',
  'type',
  'quantity',
  'referenceType',
  'referenceId',
  'notes',
  'createdAt',
  'createdBy',
]);

export default InventoryTransactionScalarFieldEnumSchema;
