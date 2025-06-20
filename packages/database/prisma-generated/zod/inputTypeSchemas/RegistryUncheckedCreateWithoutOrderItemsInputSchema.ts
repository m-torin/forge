import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema';

export const RegistryUncheckedCreateWithoutOrderItemsInputSchema: z.ZodType<Prisma.RegistryUncheckedCreateWithoutOrderItemsInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  type: z.lazy(() => RegistryTypeSchema).optional(),
  isPublic: z.boolean().optional(),
  eventDate: z.coerce.date().optional().nullable(),
  createdByUserId: z.string().optional().nullable(),
  items: z.lazy(() => RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema).optional(),
  users: z.lazy(() => RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema).optional()
}).strict();

export default RegistryUncheckedCreateWithoutOrderItemsInputSchema;
