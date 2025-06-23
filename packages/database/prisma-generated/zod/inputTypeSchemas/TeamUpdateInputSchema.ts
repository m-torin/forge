import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { OrganizationUpdateOneRequiredWithoutTeamsNestedInputSchema } from './OrganizationUpdateOneRequiredWithoutTeamsNestedInputSchema';
import { InvitationUpdateManyWithoutTeamNestedInputSchema } from './InvitationUpdateManyWithoutTeamNestedInputSchema';
import { TeamMemberUpdateManyWithoutTeamNestedInputSchema } from './TeamMemberUpdateManyWithoutTeamNestedInputSchema';

export const TeamUpdateInputSchema: z.ZodType<Prisma.TeamUpdateInput> = z
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
    organization: z
      .lazy(() => OrganizationUpdateOneRequiredWithoutTeamsNestedInputSchema)
      .optional(),
    invitations: z.lazy(() => InvitationUpdateManyWithoutTeamNestedInputSchema).optional(),
    teamMembers: z.lazy(() => TeamMemberUpdateManyWithoutTeamNestedInputSchema).optional(),
  })
  .strict();

export default TeamUpdateInputSchema;
