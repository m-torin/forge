import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { EnumRegistryUserRoleFieldUpdateOperationsInputSchema } from './EnumRegistryUserRoleFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutRegistriesNestedInputSchema } from './UserUpdateOneRequiredWithoutRegistriesNestedInputSchema';

export const RegistryUserJoinUpdateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateWithoutRegistryInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.lazy(() => RegistryUserRoleSchema),z.lazy(() => EnumRegistryUserRoleFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutRegistriesNestedInputSchema).optional()
}).strict();

export default RegistryUserJoinUpdateWithoutRegistryInputSchema;
