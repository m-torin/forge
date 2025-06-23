import { z } from 'zod';
import type { Prisma } from '../../client';

export const CartCountOutputTypeSelectSchema: z.ZodType<Prisma.CartCountOutputTypeSelect> = z
  .object({
    items: z.boolean().optional(),
  })
  .strict();

export default CartCountOutputTypeSelectSchema;
