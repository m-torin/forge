import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { RegistryUpdateOneRequiredWithoutItemsNestedInputSchema } from './RegistryUpdateOneRequiredWithoutItemsNestedInputSchema';
import { ProductUpdateOneWithoutRegistriesNestedInputSchema } from './ProductUpdateOneWithoutRegistriesNestedInputSchema';
import { CollectionUpdateOneWithoutRegistriesNestedInputSchema } from './CollectionUpdateOneWithoutRegistriesNestedInputSchema';
import { RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema } from './RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema';

export const RegistryItemUpdateWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithoutDeletedByInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  quantity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  priority: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  notes: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  purchased: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  registry: z.lazy(() => RegistryUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutRegistriesNestedInputSchema).optional(),
  collection: z.lazy(() => CollectionUpdateOneWithoutRegistriesNestedInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinUpdateManyWithoutRegistryItemNestedInputSchema).optional()
}).strict();

export default RegistryItemUpdateWithoutDeletedByInputSchema;
