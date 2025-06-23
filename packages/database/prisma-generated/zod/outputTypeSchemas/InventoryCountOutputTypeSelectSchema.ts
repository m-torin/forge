import { z } from 'zod';
import type { Prisma } from '../../client';

export const InventoryCountOutputTypeSelectSchema: z.ZodType<Prisma.InventoryCountOutputTypeSelect> =
  z
    .object({
      transactions: z.boolean().optional(),
    })
    .strict();

export default InventoryCountOutputTypeSelectSchema;
