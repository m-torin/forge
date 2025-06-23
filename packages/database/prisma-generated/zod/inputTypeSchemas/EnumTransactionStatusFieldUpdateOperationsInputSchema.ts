import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionStatusSchema } from './TransactionStatusSchema';

export const EnumTransactionStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumTransactionStatusFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => TransactionStatusSchema).optional(),
    })
    .strict();

export default EnumTransactionStatusFieldUpdateOperationsInputSchema;
