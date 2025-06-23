import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { MemberUpdateManyWithoutOrganizationNestedInputSchema } from './MemberUpdateManyWithoutOrganizationNestedInputSchema';
import { TeamUpdateManyWithoutOrganizationNestedInputSchema } from './TeamUpdateManyWithoutOrganizationNestedInputSchema';
import { InvitationUpdateManyWithoutOrganizationNestedInputSchema } from './InvitationUpdateManyWithoutOrganizationNestedInputSchema';

export const OrganizationUpdateInputSchema: z.ZodType<Prisma.OrganizationUpdateInput> = z
  .object({
    id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    logo: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    description: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    members: z.lazy(() => MemberUpdateManyWithoutOrganizationNestedInputSchema).optional(),
    teams: z.lazy(() => TeamUpdateManyWithoutOrganizationNestedInputSchema).optional(),
    invitations: z.lazy(() => InvitationUpdateManyWithoutOrganizationNestedInputSchema).optional(),
  })
  .strict();

export default OrganizationUpdateInputSchema;
