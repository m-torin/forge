import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionCreateManyOrderInputSchema } from './TransactionCreateManyOrderInputSchema';

export const TransactionCreateManyOrderInputEnvelopeSchema: z.ZodType<Prisma.TransactionCreateManyOrderInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => TransactionCreateManyOrderInputSchema),
        z.lazy(() => TransactionCreateManyOrderInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TransactionCreateManyOrderInputEnvelopeSchema;
