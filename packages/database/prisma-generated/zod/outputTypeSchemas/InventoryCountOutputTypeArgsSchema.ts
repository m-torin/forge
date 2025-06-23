import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryCountOutputTypeSelectSchema } from './InventoryCountOutputTypeSelectSchema';

export const InventoryCountOutputTypeArgsSchema: z.ZodType<Prisma.InventoryCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => InventoryCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default InventoryCountOutputTypeSelectSchema;
