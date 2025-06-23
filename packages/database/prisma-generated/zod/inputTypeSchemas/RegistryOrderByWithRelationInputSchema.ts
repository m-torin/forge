import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { RegistryItemOrderByRelationAggregateInputSchema } from './RegistryItemOrderByRelationAggregateInputSchema';
import { RegistryUserJoinOrderByRelationAggregateInputSchema } from './RegistryUserJoinOrderByRelationAggregateInputSchema';
import { CartItemOrderByRelationAggregateInputSchema } from './CartItemOrderByRelationAggregateInputSchema';
import { OrderItemOrderByRelationAggregateInputSchema } from './OrderItemOrderByRelationAggregateInputSchema';

export const RegistryOrderByWithRelationInputSchema: z.ZodType<Prisma.RegistryOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      title: z.lazy(() => SortOrderSchema).optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      isPublic: z.lazy(() => SortOrderSchema).optional(),
      eventDate: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdByUserId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      createdByUser: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      items: z.lazy(() => RegistryItemOrderByRelationAggregateInputSchema).optional(),
      users: z.lazy(() => RegistryUserJoinOrderByRelationAggregateInputSchema).optional(),
      cartItems: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
      orderItems: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default RegistryOrderByWithRelationInputSchema;
