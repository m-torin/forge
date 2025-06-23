import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TransactionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TransactionMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      orderId: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      amount: z.lazy(() => SortOrderSchema).optional(),
      currency: z.lazy(() => SortOrderSchema).optional(),
      gateway: z.lazy(() => SortOrderSchema).optional(),
      gatewayId: z.lazy(() => SortOrderSchema).optional(),
      paymentMethod: z.lazy(() => SortOrderSchema).optional(),
      last4: z.lazy(() => SortOrderSchema).optional(),
      parentTransactionId: z.lazy(() => SortOrderSchema).optional(),
      processedAt: z.lazy(() => SortOrderSchema).optional(),
      failedAt: z.lazy(() => SortOrderSchema).optional(),
      failureReason: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default TransactionMaxOrderByAggregateInputSchema;
