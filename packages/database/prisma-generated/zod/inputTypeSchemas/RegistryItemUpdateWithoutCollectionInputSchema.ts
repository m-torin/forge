import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutDeletedRegistryItemsNestedInputSchema } from './UserUpdateOneWithoutDeletedRegistryItemsNestedInputSchema';
import { RegistryUpdateOneRequiredWithoutItemsNestedInputSchema } from './RegistryUpdateOneRequiredWithoutItemsNestedInputSchema';
import { ProductUpdateOneWithoutRegistriesNestedInputSchema } from './ProductUpdateOneWithoutRegistriesNestedInputSchema';
import { RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema } from './RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema';

export const RegistryItemUpdateWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithoutCollectionInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  purchased: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedRegistryItemsNestedInputSchema).optional(),
  registry: z.lazy(() => RegistryUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutRegistriesNestedInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema).optional()
}).strict();

export default RegistryItemUpdateWithoutCollectionInputSchema;
