import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';

export const EnumPurchaseStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumPurchaseStatusFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => PurchaseStatusSchema).optional(),
    })
    .strict();

export default EnumPurchaseStatusFieldUpdateOperationsInputSchema;
