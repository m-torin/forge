import { z } from 'zod';

export const PurchaseStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);

export type PurchaseStatusType = `${z.infer<typeof PurchaseStatusSchema>}`;

export default PurchaseStatusSchema;
