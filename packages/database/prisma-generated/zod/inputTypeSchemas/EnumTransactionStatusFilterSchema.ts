import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionStatusSchema } from './TransactionStatusSchema';
import { NestedEnumTransactionStatusFilterSchema } from './NestedEnumTransactionStatusFilterSchema';

export const EnumTransactionStatusFilterSchema: z.ZodType<Prisma.EnumTransactionStatusFilter> = z.object({
  equals: z.lazy(() => TransactionStatusSchema).optional(),
  in: z.lazy(() => TransactionStatusSchema).array().optional(),
  notIn: z.lazy(() => TransactionStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => TransactionStatusSchema),z.lazy(() => NestedEnumTransactionStatusFilterSchema) ]).optional(),
}).strict();

export default EnumTransactionStatusFilterSchema;
