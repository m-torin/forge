import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { EnumRegistryUserRoleFieldUpdateOperationsInputSchema } from './EnumRegistryUserRoleFieldUpdateOperationsInputSchema';
import { RegistryUpdateOneRequiredWithoutUsersNestedInputSchema } from './RegistryUpdateOneRequiredWithoutUsersNestedInputSchema';

export const RegistryUserJoinUpdateWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateWithoutUserInput> =
  z
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
      role: z
        .union([
          z.lazy(() => RegistryUserRoleSchema),
          z.lazy(() => EnumRegistryUserRoleFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      registry: z.lazy(() => RegistryUpdateOneRequiredWithoutUsersNestedInputSchema).optional(),
    })
    .strict();

export default RegistryUserJoinUpdateWithoutUserInputSchema;
