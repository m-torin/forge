import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema';

export const RegistryItemUncheckedCreateWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUncheckedCreateWithoutDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  quantity: z.number().int().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional().nullable(),
  purchased: z.boolean().optional(),
  registryId: z.string(),
  productId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  purchases: z.lazy(() => RegistryPurchaseJoinUncheckedCreateNestedManyWithoutRegistryItemInputSchema).optional()
}).strict();

export default RegistryItemUncheckedCreateWithoutDeletedByInputSchema;
