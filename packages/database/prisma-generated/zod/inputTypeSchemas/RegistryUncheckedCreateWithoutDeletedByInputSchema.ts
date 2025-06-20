import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema';

export const RegistryUncheckedCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryUncheckedCreateWithoutDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.lazy(() => RegistryTypeSchema).optional(),
  isPublic: z.boolean().optional(),
  eventDate: z.coerce.date().optional().nullable(),
  createdByUserId: z.string().optional().nullable(),
  items: z.lazy(() => RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema).optional(),
  users: z.lazy(() => RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema).optional()
}).strict();

export default RegistryUncheckedCreateWithoutDeletedByInputSchema;
