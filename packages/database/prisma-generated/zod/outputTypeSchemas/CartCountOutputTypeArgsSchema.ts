import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartCountOutputTypeSelectSchema } from './CartCountOutputTypeSelectSchema';

export const CartCountOutputTypeArgsSchema: z.ZodType<Prisma.CartCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CartCountOutputTypeSelectSchema).nullish(),
}).strict();

export default CartCountOutputTypeSelectSchema;
