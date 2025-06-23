import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema } from './OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema';

export const RegistryUncheckedCreateWithoutCartItemsInputSchema: z.ZodType<Prisma.RegistryUncheckedCreateWithoutCartItemsInput> =
  z
    .object({
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
      items: z
        .lazy(() => RegistryItemUncheckedCreateNestedManyWithoutRegistryInputSchema)
        .optional(),
      users: z
        .lazy(() => RegistryUserJoinUncheckedCreateNestedManyWithoutRegistryInputSchema)
        .optional(),
      orderItems: z
        .lazy(() => OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema)
        .optional(),
    })
    .strict();

export default RegistryUncheckedCreateWithoutCartItemsInputSchema;
