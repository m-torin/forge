import { z } from 'zod';

export const TransactionTypeSchema = z.enum(['PAYMENT','REFUND','PARTIAL_REFUND','VOID']);

export type TransactionTypeType = `${z.infer<typeof TransactionTypeSchema>}`

export default TransactionTypeSchema;
