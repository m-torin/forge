import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderArgsSchema } from "../outputTypeSchemas/OrderArgsSchema"
import { TransactionArgsSchema } from "../outputTypeSchemas/TransactionArgsSchema"
import { TransactionFindManyArgsSchema } from "../outputTypeSchemas/TransactionFindManyArgsSchema"
import { TransactionCountOutputTypeArgsSchema } from "../outputTypeSchemas/TransactionCountOutputTypeArgsSchema"

export const TransactionSelectSchema: z.ZodType<Prisma.TransactionSelect> = z.object({
  id: z.boolean().optional(),
  orderId: z.boolean().optional(),
  type: z.boolean().optional(),
  status: z.boolean().optional(),
  amount: z.boolean().optional(),
  currency: z.boolean().optional(),
  gateway: z.boolean().optional(),
  gatewayId: z.boolean().optional(),
  gatewayResponse: z.boolean().optional(),
  paymentMethod: z.boolean().optional(),
  last4: z.boolean().optional(),
  parentTransactionId: z.boolean().optional(),
  metadata: z.boolean().optional(),
  processedAt: z.boolean().optional(),
  failedAt: z.boolean().optional(),
  failureReason: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  order: z.union([z.boolean(),z.lazy(() => OrderArgsSchema)]).optional(),
  parentTransaction: z.union([z.boolean(),z.lazy(() => TransactionArgsSchema)]).optional(),
  refunds: z.union([z.boolean(),z.lazy(() => TransactionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TransactionCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default TransactionSelectSchema;
