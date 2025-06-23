import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CartItemMinOrderByAggregateInputSchema: z.ZodType<Prisma.CartItemMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      cartId: z.lazy(() => SortOrderSchema).optional(),
      productId: z.lazy(() => SortOrderSchema).optional(),
      variantId: z.lazy(() => SortOrderSchema).optional(),
      quantity: z.lazy(() => SortOrderSchema).optional(),
      price: z.lazy(() => SortOrderSchema).optional(),
      isGift: z.lazy(() => SortOrderSchema).optional(),
      giftMessage: z.lazy(() => SortOrderSchema).optional(),
      registryId: z.lazy(() => SortOrderSchema).optional(),
      savedForLater: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default CartItemMinOrderByAggregateInputSchema;
