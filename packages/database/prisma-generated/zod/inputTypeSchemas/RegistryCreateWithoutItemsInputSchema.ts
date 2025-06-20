import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { UserCreateNestedOneWithoutDeletedRegistriesInputSchema } from './UserCreateNestedOneWithoutDeletedRegistriesInputSchema';
import { UserCreateNestedOneWithoutCreatedRegistriesInputSchema } from './UserCreateNestedOneWithoutCreatedRegistriesInputSchema';
import { RegistryUserJoinCreateNestedManyWithoutRegistryInputSchema } from './RegistryUserJoinCreateNestedManyWithoutRegistryInputSchema';
import { CartItemCreateNestedManyWithoutRegistryInputSchema } from './CartItemCreateNestedManyWithoutRegistryInputSchema';
import { OrderItemCreateNestedManyWithoutRegistryInputSchema } from './OrderItemCreateNestedManyWithoutRegistryInputSchema';

export const RegistryCreateWithoutItemsInputSchema: z.ZodType<Prisma.RegistryCreateWithoutItemsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.lazy(() => RegistryTypeSchema).optional(),
  isPublic: z.boolean().optional(),
  eventDate: z.coerce.date().optional().nullable(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedRegistriesInputSchema).optional(),
  createdByUser: z.lazy(() => UserCreateNestedOneWithoutCreatedRegistriesInputSchema).optional(),
  users: z.lazy(() => RegistryUserJoinCreateNestedManyWithoutRegistryInputSchema).optional(),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutRegistryInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemCreateNestedManyWithoutRegistryInputSchema).optional()
}).strict();

export default RegistryCreateWithoutItemsInputSchema;
