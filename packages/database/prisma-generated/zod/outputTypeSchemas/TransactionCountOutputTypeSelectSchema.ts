import { z } from 'zod';
import type { Prisma } from '../../client';

export const TransactionCountOutputTypeSelectSchema: z.ZodType<Prisma.TransactionCountOutputTypeSelect> =
  z
    .object({
      refunds: z.boolean().optional(),
    })
    .strict();

export default TransactionCountOutputTypeSelectSchema;
