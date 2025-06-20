import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { EnumRegistryTypeFieldUpdateOperationsInputSchema } from './EnumRegistryTypeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { UserUpdateOneWithoutDeletedRegistriesNestedInputSchema } from './UserUpdateOneWithoutDeletedRegistriesNestedInputSchema';
import { UserUpdateOneWithoutCreatedRegistriesNestedInputSchema } from './UserUpdateOneWithoutCreatedRegistriesNestedInputSchema';
import { RegistryUserJoinUpdateManyWithoutRegistryNestedInputSchema } from './RegistryUserJoinUpdateManyWithoutRegistryNestedInputSchema';
import { CartItemUpdateManyWithoutRegistryNestedInputSchema } from './CartItemUpdateManyWithoutRegistryNestedInputSchema';
import { OrderItemUpdateManyWithoutRegistryNestedInputSchema } from './OrderItemUpdateManyWithoutRegistryNestedInputSchema';

export const RegistryUpdateWithoutItemsInputSchema: z.ZodType<Prisma.RegistryUpdateWithoutItemsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  type: z.union([ z.lazy(() => RegistryTypeSchema),z.lazy(() => EnumRegistryTypeFieldUpdateOperationsInputSchema) ]).optional(),
  isPublic: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  eventDate: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedRegistriesNestedInputSchema).optional(),
  createdByUser: z.lazy(() => UserUpdateOneWithoutCreatedRegistriesNestedInputSchema).optional(),
  users: z.lazy(() => RegistryUserJoinUpdateManyWithoutRegistryNestedInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUpdateManyWithoutRegistryNestedInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUpdateManyWithoutRegistryNestedInputSchema).optional()
}).strict();

export default RegistryUpdateWithoutItemsInputSchema;
