import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema } from './UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema';
import { ProductCreateNestedOneWithoutRegistriesInputSchema } from './ProductCreateNestedOneWithoutRegistriesInputSchema';
import { CollectionCreateNestedOneWithoutRegistriesInputSchema } from './CollectionCreateNestedOneWithoutRegistriesInputSchema';
import { RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemCreateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemCreateWithoutRegistryInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  quantity: z.number().int().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional().nullable(),
  purchased: z.boolean().optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedRegistryItemsInputSchema).optional(),
  product: z.lazy(() => ProductCreateNestedOneWithoutRegistriesInputSchema).optional(),
  collection: z.lazy(() => CollectionCreateNestedOneWithoutRegistriesInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema).optional()
}).strict();

export default RegistryItemCreateWithoutRegistryInputSchema;
