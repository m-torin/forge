import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { EnumRegistryTypeFieldUpdateOperationsInputSchema } from './EnumRegistryTypeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutRegistryNestedInputSchema } from './RegistryItemUncheckedUpdateManyWithoutRegistryNestedInputSchema';
import { RegistryUserJoinUncheckedUpdateManyWithoutRegistryNestedInputSchema } from './RegistryUserJoinUncheckedUpdateManyWithoutRegistryNestedInputSchema';
import { CartItemUncheckedUpdateManyWithoutRegistryNestedInputSchema } from './CartItemUncheckedUpdateManyWithoutRegistryNestedInputSchema';
import { OrderItemUncheckedUpdateManyWithoutRegistryNestedInputSchema } from './OrderItemUncheckedUpdateManyWithoutRegistryNestedInputSchema';

export const RegistryUncheckedUpdateInputSchema: z.ZodType<Prisma.RegistryUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    type: z
      .union([
        z.lazy(() => RegistryTypeSchema),
        z.lazy(() => EnumRegistryTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    isPublic: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
    eventDate: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    createdByUserId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    items: z.lazy(() => RegistryItemUncheckedUpdateManyWithoutRegistryNestedInputSchema).optional(),
    users: z
      .lazy(() => RegistryUserJoinUncheckedUpdateManyWithoutRegistryNestedInputSchema)
      .optional(),
    cartItems: z.lazy(() => CartItemUncheckedUpdateManyWithoutRegistryNestedInputSchema).optional(),
    orderItems: z
      .lazy(() => OrderItemUncheckedUpdateManyWithoutRegistryNestedInputSchema)
      .optional(),
  })
  .strict();

export default RegistryUncheckedUpdateInputSchema;
