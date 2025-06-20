import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionTypeSchema } from './TransactionTypeSchema';

export const NestedEnumTransactionTypeFilterSchema: z.ZodType<Prisma.NestedEnumTransactionTypeFilter> = z.object({
  equals: z.lazy(() => TransactionTypeSchema).optional(),
  in: z.lazy(() => TransactionTypeSchema).array().optional(),
  notIn: z.lazy(() => TransactionTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => TransactionTypeSchema),z.lazy(() => NestedEnumTransactionTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumTransactionTypeFilterSchema;
