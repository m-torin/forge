import { z } from 'zod';

export const TransactionScalarFieldEnumSchema = z.enum(['id','orderId','type','status','amount','currency','gateway','gatewayId','gatewayResponse','paymentMethod','last4','parentTransactionId','metadata','processedAt','failedAt','failureReason','createdAt','updatedAt']);

export default TransactionScalarFieldEnumSchema;
