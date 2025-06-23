import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateNestedOneWithoutItemsInputSchema } from './RegistryCreateNestedOneWithoutItemsInputSchema';
import { ProductCreateNestedOneWithoutRegistriesInputSchema } from './ProductCreateNestedOneWithoutRegistriesInputSchema';
import { CollectionCreateNestedOneWithoutRegistriesInputSchema } from './CollectionCreateNestedOneWithoutRegistriesInputSchema';
import { RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemCreateWithoutDeletedByInput> =
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
      registry: z.lazy(() => RegistryCreateNestedOneWithoutItemsInputSchema),
      product: z.lazy(() => ProductCreateNestedOneWithoutRegistriesInputSchema).optional(),
      collection: z.lazy(() => CollectionCreateNestedOneWithoutRegistriesInputSchema).optional(),
      purchases: z
        .lazy(() => RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema)
        .optional(),
    })
    .strict();

export default RegistryItemCreateWithoutDeletedByInputSchema;
