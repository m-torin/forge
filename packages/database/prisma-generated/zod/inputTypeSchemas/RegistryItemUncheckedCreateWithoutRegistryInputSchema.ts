import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemUncheckedCreateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemUncheckedCreateWithoutRegistryInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      deletedById: z.string().optional().nullable(),
      quantity: z.number().int().optional(),
      priority: z.number().int().optional(),
      notes: z.string().optional().nullable(),
      purchased: z.boolean().optional(),
      productId: z.string().optional().nullable(),
      collectionId: z.string().optional().nullable(),
      purchases: z
        .lazy(() => RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema)
        .optional(),
    })
    .strict();

export default RegistryItemUncheckedCreateWithoutRegistryInputSchema;
