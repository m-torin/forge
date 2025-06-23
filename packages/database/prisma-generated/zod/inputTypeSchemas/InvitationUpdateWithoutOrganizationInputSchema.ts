import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { TeamUpdateOneWithoutInvitationsNestedInputSchema } from './TeamUpdateOneWithoutInvitationsNestedInputSchema';
import { UserUpdateOneRequiredWithoutInvitationsSentNestedInputSchema } from './UserUpdateOneRequiredWithoutInvitationsSentNestedInputSchema';

export const InvitationUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.InvitationUpdateWithoutOrganizationInput> =
  z
    .object({
      id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      role: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      status: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      expiresAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      team: z.lazy(() => TeamUpdateOneWithoutInvitationsNestedInputSchema).optional(),
      invitedBy: z
        .lazy(() => UserUpdateOneRequiredWithoutInvitationsSentNestedInputSchema)
        .optional(),
    })
    .strict();

export default InvitationUpdateWithoutOrganizationInputSchema;
