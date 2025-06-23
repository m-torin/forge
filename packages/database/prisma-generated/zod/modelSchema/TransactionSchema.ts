import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { Prisma } from '../../client';
import { TransactionTypeSchema } from '../inputTypeSchemas/TransactionTypeSchema';
import { TransactionStatusSchema } from '../inputTypeSchemas/TransactionStatusSchema';

/////////////////////////////////////////
// TRANSACTION SCHEMA
/////////////////////////////////////////

export const TransactionSchema = z.object({
  type: TransactionTypeSchema,
  status: TransactionStatusSchema,
  id: z.string().cuid(),
  orderId: z.string(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'Transaction']",
  }),
  currency: z.string(),
  gateway: z.string(),
  gatewayId: z.string().nullable(),
  gatewayResponse: JsonValueSchema.nullable(),
  paymentMethod: z.string().nullable(),
  last4: z.string().nullable(),
  parentTransactionId: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  processedAt: z.coerce.date().nullable(),
  failedAt: z.coerce.date().nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export default TransactionSchema;
