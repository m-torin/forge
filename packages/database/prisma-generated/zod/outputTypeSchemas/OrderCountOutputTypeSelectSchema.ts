import { z } from 'zod';
import type { Prisma } from '../../client';

export const OrderCountOutputTypeSelectSchema: z.ZodType<Prisma.OrderCountOutputTypeSelect> = z
  .object({
    items: z.boolean().optional(),
    transactions: z.boolean().optional(),
  })
  .strict();

export default OrderCountOutputTypeSelectSchema;
