import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema } from './UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema';
import { RegistryCreateNestedOneWithoutItemsInputSchema } from './RegistryCreateNestedOneWithoutItemsInputSchema';
import { CollectionCreateNestedOneWithoutRegistriesInputSchema } from './CollectionCreateNestedOneWithoutRegistriesInputSchema';
import { RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemCreateWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemCreateWithoutProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      quantity: z.number().int().optional(),
      priority: z.number().int().optional(),
      notes: z.string().optional().nullable(),
      purchased: z.boolean().optional(),
      deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema).optional(),
      registry: z.lazy(() => RegistryCreateNestedOneWithoutItemsInputSchema),
      collection: z.lazy(() => CollectionCreateNestedOneWithoutRegistriesInputSchema).optional(),
      purchases: z
        .lazy(() => RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema)
        .optional(),
    })
    .strict();

export default RegistryItemCreateWithoutProductInputSchema;
