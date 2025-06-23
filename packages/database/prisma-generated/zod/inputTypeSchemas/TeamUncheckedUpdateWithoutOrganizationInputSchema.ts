import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { InvitationUncheckedUpdateManyWithoutTeamNestedInputSchema } from './InvitationUncheckedUpdateManyWithoutTeamNestedInputSchema';
import { TeamMemberUncheckedUpdateManyWithoutTeamNestedInputSchema } from './TeamMemberUncheckedUpdateManyWithoutTeamNestedInputSchema';

export const TeamUncheckedUpdateWithoutOrganizationInputSchema: z.ZodType<Prisma.TeamUncheckedUpdateWithoutOrganizationInput> =
  z
    .object({
      id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      description: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      invitations: z
        .lazy(() => InvitationUncheckedUpdateManyWithoutTeamNestedInputSchema)
        .optional(),
      teamMembers: z
        .lazy(() => TeamMemberUncheckedUpdateManyWithoutTeamNestedInputSchema)
        .optional(),
    })
    .strict();

export default TeamUncheckedUpdateWithoutOrganizationInputSchema;
