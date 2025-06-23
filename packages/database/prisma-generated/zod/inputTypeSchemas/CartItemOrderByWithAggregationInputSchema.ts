import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CartItemCountOrderByAggregateInputSchema } from './CartItemCountOrderByAggregateInputSchema';
import { CartItemAvgOrderByAggregateInputSchema } from './CartItemAvgOrderByAggregateInputSchema';
import { CartItemMaxOrderByAggregateInputSchema } from './CartItemMaxOrderByAggregateInputSchema';
import { CartItemMinOrderByAggregateInputSchema } from './CartItemMinOrderByAggregateInputSchema';
import { CartItemSumOrderByAggregateInputSchema } from './CartItemSumOrderByAggregateInputSchema';

export const CartItemOrderByWithAggregationInputSchema: z.ZodType<Prisma.CartItemOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      cartId: z.lazy(() => SortOrderSchema).optional(),
      productId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      variantId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      quantity: z.lazy(() => SortOrderSchema).optional(),
      price: z.lazy(() => SortOrderSchema).optional(),
      isGift: z.lazy(() => SortOrderSchema).optional(),
      giftMessage: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      registryId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      savedForLater: z.lazy(() => SortOrderSchema).optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      _count: z.lazy(() => CartItemCountOrderByAggregateInputSchema).optional(),
      _avg: z.lazy(() => CartItemAvgOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => CartItemMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => CartItemMinOrderByAggregateInputSchema).optional(),
      _sum: z.lazy(() => CartItemSumOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default CartItemOrderByWithAggregationInputSchema;
