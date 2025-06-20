import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateManyParentTransactionInputSchema } from './TransactionCreateManyParentTransactionInputSchema';

export const TransactionCreateManyParentTransactionInputEnvelopeSchema: z.ZodType<Prisma.TransactionCreateManyParentTransactionInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => TransactionCreateManyParentTransactionInputSchema),z.lazy(() => TransactionCreateManyParentTransactionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default TransactionCreateManyParentTransactionInputEnvelopeSchema;
