import type { Prisma } from '../../client';

import { z } from 'zod';

export const CartItemCartIdProductIdVariantIdCompoundUniqueInputSchema: z.ZodType<Prisma.CartItemCartIdProductIdVariantIdCompoundUniqueInput> = z.object({
  cartId: z.string(),
  productId: z.string(),
  variantId: z.string()
}).strict();

export default CartItemCartIdProductIdVariantIdCompoundUniqueInputSchema;
