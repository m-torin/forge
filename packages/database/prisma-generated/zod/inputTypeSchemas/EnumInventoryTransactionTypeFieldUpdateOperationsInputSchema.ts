import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionTypeSchema } from './InventoryTransactionTypeSchema';

export const EnumInventoryTransactionTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumInventoryTransactionTypeFieldUpdateOperationsInput> =
  z
    .object({
      set: z.lazy(() => InventoryTransactionTypeSchema).optional(),
    })
    .strict();

export default EnumInventoryTransactionTypeFieldUpdateOperationsInputSchema;
