import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
]);

export type OrderStatusType = `${z.infer<typeof OrderStatusSchema>}`;

export default OrderStatusSchema;
