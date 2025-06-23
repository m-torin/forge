import { z } from 'zod';

export const CartScalarFieldEnumSchema = z.enum([
  'id',
  'userId',
  'sessionId',
  'status',
  'expiresAt',
  'currency',
  'notes',
  'metadata',
  'abandonedAt',
  'recoveredAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
]);

export default CartScalarFieldEnumSchema;
