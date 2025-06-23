import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CartOrderByWithRelationInputSchema } from './CartOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { RegistryOrderByWithRelationInputSchema } from './RegistryOrderByWithRelationInputSchema';

export const CartItemOrderByWithRelationInputSchema: z.ZodType<Prisma.CartItemOrderByWithRelationInput> =
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
      cart: z.lazy(() => CartOrderByWithRelationInputSchema).optional(),
      product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      variant: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      registry: z.lazy(() => RegistryOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default CartItemOrderByWithRelationInputSchema;
