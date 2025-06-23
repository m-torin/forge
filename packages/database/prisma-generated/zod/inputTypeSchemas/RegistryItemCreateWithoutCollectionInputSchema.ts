import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema } from './UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema';
import { RegistryCreateNestedOneWithoutItemsInputSchema } from './RegistryCreateNestedOneWithoutItemsInputSchema';
import { ProductCreateNestedOneWithoutRegistriesInputSchema } from './ProductCreateNestedOneWithoutRegistriesInputSchema';
import { RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemCreateWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemCreateWithoutCollectionInput> =
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
      product: z.lazy(() => ProductCreateNestedOneWithoutRegistriesInputSchema).optional(),
      purchases: z
        .lazy(() => RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema)
        .optional(),
    })
    .strict();

export default RegistryItemCreateWithoutCollectionInputSchema;
