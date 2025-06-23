import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { OrderOrderByWithRelationInputSchema } from './OrderOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { RegistryOrderByWithRelationInputSchema } from './RegistryOrderByWithRelationInputSchema';

export const OrderItemOrderByWithRelationInputSchema: z.ZodType<Prisma.OrderItemOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      orderId: z.lazy(() => SortOrderSchema).optional(),
      productId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      variantId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      productName: z.lazy(() => SortOrderSchema).optional(),
      variantName: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      sku: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      quantity: z.lazy(() => SortOrderSchema).optional(),
      price: z.lazy(() => SortOrderSchema).optional(),
      total: z.lazy(() => SortOrderSchema).optional(),
      isGift: z.lazy(() => SortOrderSchema).optional(),
      giftMessage: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      registryId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      fulfilledAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      order: z.lazy(() => OrderOrderByWithRelationInputSchema).optional(),
      product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      variant: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      registry: z.lazy(() => RegistryOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default OrderItemOrderByWithRelationInputSchema;
