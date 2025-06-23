import { z } from 'zod';

export const TransactionStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED',
]);

export type TransactionStatusType = `${z.infer<typeof TransactionStatusSchema>}`;

export default TransactionStatusSchema;
