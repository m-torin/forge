import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { EnumRegistryUserRoleFieldUpdateOperationsInputSchema } from './EnumRegistryUserRoleFieldUpdateOperationsInputSchema';

export const RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUncheckedUpdateWithoutRegistryInput> =
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
      userId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export default RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema;
