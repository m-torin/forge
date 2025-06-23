import { z } from 'zod';

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'PAID',
  'PARTIALLY_PAID',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'CANCELLED',
]);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`;

export default PaymentStatusSchema;
