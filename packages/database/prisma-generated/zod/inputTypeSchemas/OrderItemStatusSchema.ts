import { z } from 'zod';

export const OrderItemStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'FULFILLED',
  'CANCELLED',
  'REFUNDED',
]);

export type OrderItemStatusType = `${z.infer<typeof OrderItemStatusSchema>}`;

export default OrderItemStatusSchema;
