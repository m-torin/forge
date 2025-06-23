import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderCountOutputTypeSelectSchema } from './OrderCountOutputTypeSelectSchema';

export const OrderCountOutputTypeArgsSchema: z.ZodType<Prisma.OrderCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => OrderCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export default OrderCountOutputTypeSelectSchema;
